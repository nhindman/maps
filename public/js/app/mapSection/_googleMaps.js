define(function(require, exports, module){
  var
    Surface          = require('famous/Surface'),
    Matrix           = require('famous/Matrix'),
    Modifier         = require('famous/Modifier'),
    Timer            = require('famous/Timer'),
    async            = require('../../../lib/requirejs-plugins/src/async');

  require('../../../lib/requirejs-plugins/src/async!https://maps.googleapis.com/maps/api/js?key=AIzaSyCUK_sH0MT-pkWbyBGJe-XoJ_kldSde81o&sensor=true');

  module.exports = function(mapSection){

    var map;
    var mapSurface = new Surface({
      content: '<div id="map-canvas" />'
    });

    mapSection.add(mapSurface);
    
    var initialize = function() {
      directionsDisplay = new google.maps.DirectionsRenderer();

      var mapOptions = {
        zoom: 14,
        disableDefaultUI: true,
        disableDoubleClickZoom: true
      };

      map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
      directionsDisplay.setMap(map);
      var currentPos;
      navigator.geolocation.getCurrentPosition(function(position) {
        currentPos = new google.maps.LatLng(position.coords.latitude,
                       position.coords.longitude);
        map.setCenter(currentPos);

        var marker = new google.maps.Marker({
          position: currentPos,
          draggable: false,
          title: "You are here!",
          animation: 'DROP'
        });

        marker.setMap(map);

        var contentString = '<div id="content">Your current location</div>'

        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map, marker);
        });

        google.maps.event.addListener(map, 'idle', function() {
          pingYelp(map.center.d, map.center.e);
        })
      });
    };

    var pingYelp = function(lat, lng) {
      console.log(lat);
      console.log(lng);
      $.ajax({
        type: 'GET',
        url: '/yelp/geo/',
        data: {lat: lat, long: lng},
        success: function(data) {
          console.log(data);
        },
        error: function() {
          console.log("Ajax post request error");
        }
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

    Timer.setTimeout(initialize, 1500);
  }
});