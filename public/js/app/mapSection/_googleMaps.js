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

    PE.attach([spring]);

    mapSurface.on('deploy', function(){
      initialize();
    });

    mapSurface.on('click', function(e) {
      applyTorque(e, 1);
    });

    body.add(new Modifier(Matrix.translate(0,0,.1))).link(mapSurface);

    var mapNode = new RenderNode();
    mapNode.link(mapSurface).add(new Modifier({origin : [.5,.5]})).link(PE);
    require('app/mapSection/_mapCards')(mapNode, FamousEngine, eventHandler, allMarkers);

    // mainDisplay.add(mapSurface);

    function attachTorqueSpring(){
      mapNode.attachedSpring = PE.attach(torqueSpring);
    }

    attachTorqueSpring();

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
          icon: 'img/blueMarker.png'
        });
      }
      boundMarkers[id].marker.setOptions({
        icon: 'img/blueMarkerHighlight.png'
      });
      highlightedID = id;
    });

    eventHandler.on('unfocus', function(id){
      allMarkers[id].marker.setOptions({
        icon: 'img/blueMarker.png'
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

      map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

      directionsDisplay.setMap(map);

      // eventHandler.emit('maploaded')
      startQuery();
    };

    var getCurrentPosition = function(){
      navigator.geolocation.getCurrentPosition(function(position){
        currentLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        return new google.maps.LatLng(currentLatLng.lat, currentLatLng.lng);
      });
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
        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map, marker);
        });

        google.maps.event.addListener(map, 'bounds_changed', function() {
          addAndRemoveCards();
          reQuery();
        });
        fetchData();

      });
    }

    // eventHandler.on('startQuery', startQuery)

    var calcRoute = function(lat, lng) {
      directionsDisplay.setMap(map);
      var newLocation = new google.maps.LatLng(lat, lng);
      eventHandler.on('startQuery', startQuery)
      navigator.geolocation.getCurrentPosition(function(position) {
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
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
            removeScroll();
          }
        });
      });
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
      for (marker in allMarkers) {
        allMarkers[marker].marker.setMap(input);
      }
    };

    showRoute = function(e){
      var lat = allMarkers[e.id].data.lat;
      var lng = allMarkers[e.id].data.long;
      toggleMarkers(null);
      calcRoute(lat, lng);
    };
    removeScroll = function(){
      scrollmod.setTransform(Matrix.translate(0, window.innerHeight, 0), {duration: 1200});
      exitRouteModifier.setTransform(Matrix.translate(window.innerWidth/10, 0, 1), {duration: 1200});
    };

    eventHandler.on('walking-dir', showRoute);

    exitRoute = function(){
      toggleMarkers(map);
      dropMarkers();
      map.setZoom(15);
      map.setCenter(getCurrentPosition());
      directionsDisplay.setMap(null);
      scrollmod.setTransform(Matrix.translate(0, 0, 0), {duration: 800});
      exitRouteModifier.setTransform(Matrix.translate(window.innerWidth/10, -window.innerHeight, 1), {duration: 800});
    };

    // replaceScroll = function(){
    // };




//Exit route surface
    exitRouteModifier = new Modifier({
      transform: Matrix.translate(window.innerWidth/10, -window.innerHeight, 1)
    });

    exitRouteSurface = new Surface({
      content: '<div class="exitRoute">^</div>',
      size: [window.innerHeight/5, window.innerWidth/5],
      properties: {
        'font-size': '5rem',
        color: 'black',
        opacity: '0.5'
      }
    });

    mapNode.add(exitRouteModifier).link(exitRouteSurface);
    
    exitRouteSurface.on('touchstart', exitRoute);
    // var intervalID = window.setInterval(initialize, 0);
    return mapNode;
  }
});