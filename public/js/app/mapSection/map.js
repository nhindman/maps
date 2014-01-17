define(function(require, exports, module){
  var
  Surface          = require('famous/Surface'),
  Matrix           = require('famous/Matrix'),
  Modifier         = require('famous/Modifier'),
  Timer            = require('famous/Timer'),
  async            = require('../../../lib/requirejs-plugins/src/async');

  require('../../../lib/requirejs-plugins/src/async!https://maps.googleapis.com/maps/api/js?key=AIzaSyCUK_sH0MT-pkWbyBGJe-XoJ_kldSde81o&sensor=true');

  module.exports = function(app){

    var mapSection = app.section('map');
    mapSection.setOptions({
      title: 'Map',
      navigation: {caption: 'Map', icon: '@'}
    });

    var mapSurface = new Surface({
      content: '<div id="map-canvas" />'
    });

    mapSection.add(mapSurface);
    
    var initialize = function() {
      directionsDisplay = new google.maps.DirectionsRenderer();
      var mapOptions = {
        zoom: 14
      };
      var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
      directionsDisplay.setMap(map);
      var pos;
      navigator.geolocation.getCurrentPosition(function(position) {
        pos = new google.maps.LatLng(position.coords.latitude,
                       position.coords.longitude);
        map.setCenter(pos);
        var marker = new google.maps.Marker({
          position: pos,
          draggable: true,
          title: "You are here!"
        });
        marker.setMap(map);
        var contentString = '<div id="content">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>'


        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map,marker);
        });
      });
    };

    var calcRoute = function() {
      var newLocation = new google.maps.LatLng(37.7877981, -122,4042715);
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude,
                       position.coords.longitude);
        var directionsService = new google.maps.DirectionsService();
        var request = {
          origin: pos,
          destination: newLocation,
          provideRouteAlternatives: false,
          travelMode: google.maps.TravelMode.DRIVING
        }
        directionsService.route(request, function(result, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
          }
        });
      });
    };
    Timer.setTimeout(initialize, 1500);

    require('app/mapSection/map-cards')(mapSection);

  }
});