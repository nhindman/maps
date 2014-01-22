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
    // {
    //   "featureType": "road",
    //   "elementType": "geometry.stroke",
    //   "stylers": [
    //     {
    //       "color": "#808080"
    //     },
    //     {
    //       "lightness": 54
    //     }
    //   ]
    // },
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

    var queryRadius = 3000 // meters

    var currentLatLng;
    navigator.geolocation.getCurrentPosition(function(position){
      currentLatLng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      fetchData();
      initialize();
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
      if (findDistance(currentLatLng, newCenter) > queryRadius / 4){
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
          radius: queryRadius/2
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
        styles: mapBox
      };

      map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
      directionsDisplay.setMap(map);
      var currentPos = new google.maps.LatLng(currentLatLng.lat, currentLatLng.lng);
      map.setCenter(currentPos);
      var marker = new google.maps.Marker({
        position: currentPos,
        draggable: false,
        title: "You are here!",
        animation: 'DROP',
        map: map
      });

      var contentString = '<div id="content">Your current location</div>'

      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);
      });

      google.maps.event.addListener(map, 'bounds_changed', function() {
        addAndRemoveCards();
        reQuery();
      });
      // window.clearInterval(intervalID);
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
    // var intervalID = window.setInterval(initialize, 0);

  }
});