define(function(require, exports, module){
  var
    Surface        = require('famous/Surface'),
    ScrollView     = require('famous-views/Scrollview'),
    Draggable      = require('famous-modifiers/Draggable'),
    PhysicsEngine  = require('famous-physics/PhysicsEngine');
    PhysicsTracker = require('famous-physics/utils/PhysicsTracker');

  module.exports = function(myApp, mainDisplay){

    var
      PE             = new PhysicsEngine(),
      physicsTracker = new PhysicsTracker();

    var mySection = myApp.section('map');
    mySection.setOptions({
      title: 'Map',
      navigation: {caption: 'Map', icon: '@'}
    });

    var pointsOfInterest = [];
    var scrollView = new ScrollView({
      itemSpacing: 10,
      direction: 'x'
    });

    for(var i = 0; i < 10; i++){

      // create a new surface and push it into the array of surfaces
      point = new Surface({
        size: [80, 80],
        properties: {
          'background-color': 'steelblue',
          'border-radius': '50%'
        }
      });
      pointsOfInterest.push(point);

      // create a particle and bind it to the surface
      var particle = PE.createBody({
        shape: PE.BODIES.CIRCLE,
        r: 40,
        p: [0,0,0]
      });
      particle.link(point);

      // bind touch events to each surface
      var physicsTracker = new PhysicsTracker(particle, {scale: 1});
      point.pipe(physicsTracker);
    }

    scrollView.sequenceFrom(pointsOfInterest);
    mySection.add(scrollView);
  }
});