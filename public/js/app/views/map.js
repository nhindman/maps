define(function(require, exports, module){
  var
    Surface        = require('famous/Surface'),
    ScrollView     = require('famous-views/Scrollview'),
    Draggable      = require('famous-modifiers/Draggable'),
    PhysicsEngine  = require('famous-physics/PhysicsEngine');
    PhysicsTracker = require('famous-physics/utils/PhysicsTracker'),
    View           = require('famous/View');

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


    var draggable, view;

    for(var i = 0; i < 10; i++){

      // create a new surface and push it into the array of surfaces
      draggable       = new Draggable();
      view            = new View();
      cardSurface     = new Surface({
        size: [80, 80],
        properties: {
          'background-color': 'steelblue'
        }
      });

      cardSurface.on('touchmove', function(event){
        if(event.touches[0].clientY > 250){
          cardSurface.unpipe(scrollView);
        }
      });

      cardSurface.pipe(draggable);
      view._link(draggable).link(cardSurface);

      pointsOfInterest.push(view);
      cardSurface.pipe(scrollView);


    }

    scrollView.sequenceFrom(pointsOfInterest);
    mySection.add(scrollView);
  }
});