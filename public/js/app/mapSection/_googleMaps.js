define(function(require, exports, module){
  var
    Surface  = require('famous/Surface'),
    Matrix   = require('famous/Matrix'),
    Modifier = require('famous/Modifier'),
    Timer    = require('famous/Timer'),
    async    = require('../../../lib/requirejs-plugins/src/async');

  require('../../../lib/requirejs-plugins/src/async!https://maps.googleapis.com/maps/api/js?key=AIzaSyCUK_sH0MT-pkWbyBGJe-XoJ_kldSde81o&sensor=true');

  module.exports = function(mapSection, cards){



    var queryRadius = 1500 // meters

    var currentLatLng;
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
        title: "You are here!",
        animation: 'DROP',
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

    var data;
    var allMarkers = {};
    var boundMarkers = {};

    var map;
    var mapSurface = new Surface({
      content: '<div id="map-canvas" />'
    //   size: [window.innerWidth, window.innerHeight*0.72]
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
        error: function(){
          alert('error');
        }
      });
    }

    var toRad = function(x) {
      return x * Math.PI / 180;
    };

    var findDistance = function(coord1, coord2) {
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
          animation: google.maps.Animation.DROP
        });
        allMarkers[location.id] = {
          marker: marker,
          data: location
        }
      });
    }

    var addAndRemoveCards = function(){
      var bounds = map.getBounds();
      var id, marker;
      for(id in boundMarkers){
        marker = boundMarkers[id];
        if(!bounds.contains(marker.marker.getPosition())){
          cards.removeCard(id);
          delete boundMarkers[id];
        }
      }
      for(id in allMarkers){
        marker = allMarkers[id];
        if(bounds.contains(marker.marker.getPosition())){
          if(!boundMarkers[id]){
            cards.addCard(marker.data);
            boundMarkers[id] = {
              marker: marker.marker,
              data: marker.data
            };
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
        styles: require('app/mapSection/_mapStyle')()
      };

      map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
      directionsDisplay.setMap(map);
      window.clearInterval(intervalID);
    };

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
    var intervalID = window.setInterval(initialize, 0);

  }
});