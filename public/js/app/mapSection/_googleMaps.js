define(function(require, exports, module){
  var
    Surface       = require('./customSurface'),
    Matrix        = require('famous/Matrix'),
    Modifier      = require('famous/Modifier'),
    Timer         = require('famous/Timer'),
    async         = require('../../../lib/requirejs-plugins/src/async'),
    RenderNode    = require('famous/RenderNode'),
    FamousEngine  = require('famous/Engine'),

    // Include physics for map torque
    PhysicsEngine = require('famous-physics/PhysicsEngine'),
    Vector        = require('famous-physics/math/Vector'),
    Quaternion    = require('famous-physics/math/Vector'),
    TorqueSpring  = require('famous-physics/forces/TorqueSpring'),
    Spring        = require('famous-physics/forces/Spring');

  require('../../../lib/requirejs-plugins/src/async!https://maps.googleapis.com/maps/api/js?key=AIzaSyCUK_sH0MT-pkWbyBGJe-XoJ_kldSde81o&sensor=true');

  module.exports = function(mainDisplay, eventHandler){

    var queryRadius = 1500 // meters

    var currentLatLng;

    var data;
    var allMarkers = {};
    var boundMarkers = {};
    var highlightedID;
    var first = true; // we want to emit an event to swap once all markers have been dropped, but this event should only be emitted once

    var pushStrength            = 0, 
        torqueStrength          = .003,
        torqueSpringDamping     = 20,
        torqueSpringPeriod      = 2,
        forceSpringDamping      = .95,
        forceSpringPeriod       = 2100,
        dragStrength            = .01;

    var map;
    var mapSurface = new Surface({
      content: '<div id="map-canvas" />',
      size: [window.innerWidth, window.innerHeight]
    });

    var PE     = new PhysicsEngine();
    var force  = new Vector(0,0,-pushStrength);
    var torque = new Vector(0,0,-torqueStrength);

    function applyTorque(e, side){
      var location = new Vector(
        (e.offsetX - body.size[0]/2)*side,
       -(e.offsetY - body.size[1]/2)*side,
        0
      );

      body.applyForce(force);
      body.applyTorque(location.cross(torque));
    };


    var body = PE.createBody({
        shape : PE.BODIES.RECTANGLE,
        size : [window.innerWidth, window.innerHeight]
    });
    
    var torqueSpring = new TorqueSpring({
      anchor : new Quaternion(0,0,0,0),
      period : torqueSpringPeriod,
      dampingRatio : torqueSpringDamping
    });

    var spring = new Spring({
      anchor : [0,0,0],
      period : forceSpringPeriod,
      dampingRatio : forceSpringDamping
    });

    PE.attach(spring);

    mapSurface.on('deploy', function(){
      initialize();
    });

    mapSurface.on('click', function(e) {
      applyTorque(e, 1);
    });

    body.add(mapSurface);

    var mapNode = new RenderNode();
    mapNode.link(mapSurface).add(new Modifier({origin : [.5,.5]})).link(PE);

    // mainDisplay.add(mapSurface);

    mapNode.attachedSpring = PE.attach(torqueSpring);

    var reQuery = function(){
      var newCenter = {
        lat: map.getCenter().d,
        lng: map.getCenter().e
      };
      if (findDistance(currentLatLng, newCenter) > queryRadius / 2){
        currentLatLng = newCenter;
        fetchData();
        dropMarkers();
      }
    };

    eventHandler.on('focus', function(id) {
      if(boundMarkers[highlightedID]){
        boundMarkers[highlightedID].marker.setOptions({
          icon : 'img/blueMarker.png'
        });
      }
      boundMarkers[id].marker.setOptions({
        icon: 'img/blueMarkerHighlight.png'
      });
      highlightedID = id;
    });

    eventHandler.on('unfocus', function(id){
      allMarkers[id].marker.setOptions({
        icon : 'img/blueMarker.png'
      });
    });

    var fetchData = function(){
      $.ajax({
        type: 'GET',
        url: '/points/',
        data: {
          lat: currentLatLng.lat,
          long: currentLatLng.lng,
          radius: queryRadius
        },
        success: function(apiData){
          data = apiData;
          dropMarkers();
          addAndRemoveCards();
        },
        error: function(err){
          console.log('something weird happened: ' + err)
        }
      });
    }

    var findDistance = function(coord1, coord2) {

      var toRad = function(x) {
        return x * Math.PI / 180;
      };

      var a =
        Math.pow(Math.sin(toRad(coord2.lat - coord1.lat)/2), 2) +
        Math.pow(Math.sin(toRad(coord2.lng - coord1.lng)/2), 2) *
        Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat));

      return 6378100 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    };

    var dropMarkers = function(){
      // var location;
      // for(var i = 0; i < data.length; i++){
      //   location = data[i];

      data.forEach(function(location){
        if(allMarkers[location.id]){
          return;
        }
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(location.lat, location.long),
          map: map,
          draggable: false,
          animation: !first && google.maps.Animation.DROP,
          // icon: 'img/blueMarker.png'
          icon: 'img/blueMarker.png'
        });

        google.maps.event.addListener(marker, 'click', function(){
          eventHandler.emit('focusCard', location.id);
        });

        allMarkers[location.id] = {
          marker: marker,
          data: location
        };
      });
      if(first){
        eventHandler.emit('swap');
        first = false;
      }
    }


    var addAndRemoveCards = function(){
      var bounds = map.getBounds();
      var id, marker;
      for(id in boundMarkers){
        marker = boundMarkers[id];
        if(!bounds.contains(marker.marker.getPosition())){
          eventHandler.emit('removeCard', id);
          // cards.removeCard(id);
          delete boundMarkers[id];
        }
      }
      for(id in allMarkers){
        marker = allMarkers[id];
        if(bounds.contains(marker.marker.getPosition())){
          if(!boundMarkers[id]){
            boundMarkers[id] = {
              marker: marker.marker,
              data: marker.data
            };
            eventHandler.emit('addCard', marker.data);
            // cards.addCard(marker.data);
          }
        }
      }
    }


    var initialize = function() {
      directionsDisplay = new google.maps.DirectionsRenderer();

      var mapOptions = {
        zoom: 15,
        disableDefaultUI: true,
        disableDoubleClickZoom: true,
        panControl: false,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: false,
        styles: require('app/mapSection/_mapStyle')()
      };

      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

      directionsDisplay.setMap(map);

      // eventHandler.emit('maploaded')
      startQuery();

      // create Hack Reactor marker easter egg
      var hackReactorMarker = new google.maps.Marker({
        position: new google.maps.LatLng(37.783594, -122.408904),
        draggable: false,
        icon: '/img/blueMarker.png',
        map: map
      });

      google.maps.event.addListener(hackReactorMarker, 'click', function(){
        eventHandler.emit('focusCard', 'hackreactor');
      });

      allMarkers['hackreactor'] = {
        marker: hackReactorMarker,
        data: {
          photoSuffix: '/img/hackreactor.jpg',
          rating: 10.52,
          address: '944 Market St',
          city: 'San Francisco',
          state: 'CA',
          tip: 'The motherland of DJ Fredness and some hobo musician brothers. One of them keeps trying to tell me about something called prototype chains.',
          tipUser: 'Neko the dog',
          name: 'Hack Reactor',
          lat: 37.783594,
          long: -122.408904,
          id: 'hackreactor',
          photo: '/img/hackreactor.jpg'
        }
      }
    };

    var getCurrentPosition = function(){
      navigator.geolocation.getCurrentPosition(function(position){
        currentLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      });
      return currentLatLng;
    };

    var startQuery = function(){
      navigator.geolocation.getCurrentPosition(function(position){
        currentLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var currentPos = new google.maps.LatLng(currentLatLng.lat, currentLatLng.lng);
        map.setCenter(currentPos);
        var marker = new google.maps.Marker({
          position: currentPos,
          draggable: false,
          icon: '/img/currentPosition.png',
          map: map
        });
        // google.maps.event.addListener(marker, 'click', function() {
        //   infowindow.open(map, marker);
        // });

        google.maps.event.addListener(map, 'bounds_changed', function() {
          addAndRemoveCards();
          reQuery();
        });

        fetchData();
        require('app/mapSection/_mapCards')(mapNode, FamousEngine, eventHandler, allMarkers, currentLatLng, map);
      });
    }

    // eventHandler.on('startQuery', startQuery)

    var calcRoute = function(lat, lng, name) {
      var newLocation = new google.maps.LatLng(lat, lng);
      var currentCoord;
      // eventHandler.on('startQuery', startQuery)
      navigator.geolocation.getCurrentPosition(function(position) {
        currentCoord = {lat: position.coords.latitude, lng: position.coords.longitude};
        var currentPos = new google.maps.LatLng(position.coords.latitude,
                       position.coords.longitude);
        var directionsService = new google.maps.DirectionsService();
        var request = {
          origin: currentPos,
          destination: newLocation,
          provideRouteAlternatives: false,
          travelMode: google.maps.TravelMode.WALKING
        }
        directionsService.route(request, function(result, status) {
          directionsDisplay.setMap(map);
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
            toggleMarkers(null);
            showDirections(result.routes[0].legs[0], name);
            eventHandler.emit('hideCards');
          }
        });
      });
      var bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(lat,lng));
      bounds.extend(new google.maps.LatLng(currentCoord.lat, currentCoord.lng));
    };

//Walking Directions//
    var showRoute,
    exitRoute,
    exitRouteModifier,
    exitRouteSurface,
    toggleMarkers,
    removeScroll,
    replaceScroll;

    toggleMarkers = function(input){
      for (var marker in allMarkers) {
        allMarkers[marker].marker.setMap(input);
      }
    };

    showRoute = function(e){
      var lat = allMarkers[e.id].data.lat;
      var lng = allMarkers[e.id].data.long;
      calcRoute(lat, lng, allMarkers[e.id].data.name);
      google.maps.event.clearInstanceListeners(map);
    };

    showDirections = function(directions, name){
      $('.walking-title').html('Walking directions to <span class="name">' + name + '</span>' + 
        '<br />' + 
        '<span class="duration">' + directions.duration.text + '</span>' + 
        '<br />' + 
        '<span class="address">' + directions.end_address.split(',').splice(0,2).join(', ') + '</span>'
      );
      exitRouteModifier.setTransform(Matrix.translate(0,0,50), {duration: 500, curve: 'easeOutBounce'});
    };

    eventHandler.on('walking-dir', showRoute);

    exitRoute = function(){
      toggleMarkers(map);
      dropMarkers();
      map.setZoom(15);
      // var currentPos = getCurrentPosition();
      // map.setCenter(new google.maps.LatLng(currentPos.lat, currentPos.lng));
      directionsDisplay.setMap(null);
      exitRouteModifier.setTransform(Matrix.translate(0,400,50), {duration: 800}, function(){
        eventHandler.emit('showCards');
      });
      google.maps.event.addListener(map, 'bounds_changed', function() {
        addAndRemoveCards();
        reQuery();
      });
    };



//Exit route surface
    exitRouteModifier = new Modifier({
      origin: [0,1],
      transform: Matrix.translate(0, 400, 0)
    });

    exitRouteSurface = new Surface({
      content:
        '<button><i class="back-button icon-left-circle"></i></button>' + 
        '<div class="walking">' +
          '<div class="walking-title"></div>' + 
          '<div class="walking-directions"></div>' + 
        '</div>',
      classes: ['exitRoute'],
      size: [window.innerWidth, Math.min(window.innerWidth/3, window.innerHeight/5) + 40]
    });

    exitRouteSurface.on('deploy', function(){

      // FIXME: "button" is way  too general of a selector. However, "back-button" isn't targeted on iOS devices
      $('button').on({
        'tap': exitRoute,
        'click': exitRoute
      });
    });

    mapNode.add(exitRouteModifier).link(exitRouteSurface);
    return mapNode;
  }
});