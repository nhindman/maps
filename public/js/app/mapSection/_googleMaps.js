define(function(require, exports, module){
  var
    Surface  = require('famous/Surface'),
    Matrix   = require('famous/Matrix'),
    Modifier = require('famous/Modifier'),
    Timer    = require('famous/Timer'),
    async    = require('../../../lib/requirejs-plugins/src/async');

  require('../../../lib/requirejs-plugins/src/async!https://maps.googleapis.com/maps/api/js?key=AIzaSyCUK_sH0MT-pkWbyBGJe-XoJ_kldSde81o&sensor=true');

  var mapBox = [
    {
      "featureType": "water",
      "stylers": [
        {
          "saturation": 43
        },
        {
          "lightness": -11
        },
        {
          "hue": "#0088ff"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "hue": "#ff0000"
        },
        {
          "saturation": -100
        },
        {
          "lightness": 99
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#808080"
        },
        {
          "lightness": 54
        }
      ]
    },
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#ece2d9"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#ccdca1"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#767676"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "poi",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.natural",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "on"
        },
        {
          "color": "#b8cb93"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "stylers": [
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "poi.sports_complex",
      "stylers": [
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "poi.medical",
      "stylers": [
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "poi.business",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    }
  ]

  module.exports = function(mapSection, cards){


    var currentMarkers = {};

    var map;
    var mapSurface = new Surface({
      content: '<div id="map-canvas" />',
      size: [window.innerWidth, window.innerHeight*0.72]
    });

    mapSection.add(mapSurface);
    
    var initialize = function() {
      directionsDisplay = new google.maps.DirectionsRenderer();

      var mapOptions = {
        zoom: 15,
        disableDefaultUI: true,
        disableDoubleClickZoom: true,
        styles: mapBox
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
          pingDataApi(map.center.d, map.center.e);
        })
      });
      window.clearInterval(intervalID);
    };

    var pingDataApi = function(lat, lng) {
      $.ajax({
        type: 'GET',
        url: '/points/',
        data: {lat: lat, long: lng},
        success: function(data) {
          dataIDs = {};
          var currentView = map.getBounds();

          for(var id in currentMarkers){
            if(!currentView.contains(currentMarkers[id].position)){
              currentMarkers[id].setMap(null);
              delete currentMarkers[id];
              cards.removeCard(id);
            }
          }

          var drop = function(data){
            if(!data.length){
              return;
            }
            if(currentView.contains(new google.maps.LatLng(data[0].lat, data[0].long)) && !currentMarkers[data[0].id]){
              var marker = new google.maps.Marker({
                position: new google.maps.LatLng(data[0].lat, data[0].long),
                map: map,
                draggable: false,
                title: 'enter data name here',
                animation: google.maps.Animation.DROP
              });
              currentMarkers[data[0].id] = marker;
              cards.addCard(data[0]);
            }
            dataIDs[data[0].id] = true;
            setTimeout(function(){
              drop(data.splice(1));
            }, 50);
          }
          drop(data);

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
    var intervalID = window.setInterval(initialize, 0);
    // Timer.setTimeout(initialize, 1500);

  }
});