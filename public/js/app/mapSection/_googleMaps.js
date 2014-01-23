define(function(require, exports, module){
  var
    Surface  = require('./customSurface'),
    Matrix   = require('famous/Matrix'),
    Modifier = require('famous/Modifier'),
    Timer    = require('famous/Timer'),
    async    = require('../../../lib/requirejs-plugins/src/async');

  require('../../../lib/requirejs-plugins/src/async!https://maps.googleapis.com/maps/api/js?key=AIzaSyCUK_sH0MT-pkWbyBGJe-XoJ_kldSde81o&sensor=true');

  module.exports = function(mapSection, eventHandler){

    var queryRadius = 1500 // meters

    var currentLatLng;

    var data;
    var allMarkers = {};
    var boundMarkers = {};
    var highlightedID;

    var map;
    var mapSurface = new Surface({
      content: '<div id="map-canvas" />'
    //   size: [window.innerWidth, window.innerHeight*0.72]
    });

    mapSurface.on('deploy', function(){
      initialize();
    });

    mapSection.add(mapSurface);

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
      data.forEach(function(location){
        if(allMarkers[location.id]){
          return;
        }
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(location.lat, location.long),
          map: map,
          draggable: false,
          title: 'enter data name here',
          animation: google.maps.Animation.DROP,
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
        zoom: 17,
        disableDefaultUI: true,
        disableDoubleClickZoom: true,
        styles: require('app/mapSection/_mapStyle'),
        center: new google.maps.LatLng(37.7833, -122.4167)
      };

      map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
      directionsDisplay.setMap(map);
      startQuery();
      // window.clearInterval(intervalID);
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

    var calcRoute = function() {
      var newLocation = new google.maps.LatLng(37.7877981, -122,4042715);
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
          }
        });
      });
    };
    // var intervalID = window.setInterval(initialize, 0);

  }
});