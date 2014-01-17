define(function(require, exports, module){
  var
    Surface          = require('famous/Surface'),
    ScrollView       = require('famous-views/Scrollview'),
    Draggable        = require('famous-modifiers/Draggable'),
    PhysicsEngine    = require('famous-physics/PhysicsEngine'),
    PhysicsTracker   = require('famous-physics/utils/PhysicsTracker'),
    View             = require('famous/View'),
    ContainerSurface = require('famous/ContainerSurface'),
    Matrix           = require('famous/Matrix'),
    Modifier         = require('famous/Modifier'),
    Drag             = require('famous-physics/forces/Drag'),
    RotationalDrag   = require('famous-physics/forces/RotationalDrag'),
    Spring           = require('famous-physics/forces/Spring');

  module.exports = function(app, mainDisplay){

    mainDisplay.setPerspective(500);

    var
      PE             = new PhysicsEngine(),
      physicsTracker = new PhysicsTracker();

    var
      cardSize   = [80, 120],
      cardBottom = 0.95;

    var mapSection = app.section('map');
    mapSection.setOptions({
      title: 'Map',
      navigation: {caption: 'Map', icon: '@'}
    });
    

    var goldenGateSurface = new Surface({
      size: cardSize,
      properties: {
        backgroundImage: 'url(http://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Golden_Gate_Bridge_20100906_04.JPG/80px-Golden_Gate_Bridge_20100906_04.JPG)'
      },
      classes: ['card']
    });

    var ATTSurface = new Surface({
      size: cardSize,
      properties: {
        backgroundImage: 'url(http://www.pa-wireless.org/images/80_DSC02893.JPG)'
      },
      classes: ['card']
    });

    var rotateY = function(theta, x, y){
      return new Modifier({
        transform: Matrix.rotateY(theta),
        origin: [x, y]
      });
    };
    var cardSurface;
    // create objects to the left of center
    for(var i = 1; i < 11; i++){
      cardSurface = new Surface({
        size: cardSize,
        properties: {
          backgroundColor: 'steelblue'
        },
        classes: ['card']
      });
      mapSection.add(rotateY(-1.3, 0.53 + (0.5/10)*i, cardBottom)).link(cardSurface);
    }

    // create objects to the right of center

    for(var i = 1; i < 11; i++){
      cardSurface = new Surface({
        size: cardSize,
        properties: {
          backgroundColor: 'steelblue'
        },
        classes: ['card']
      });
      mapSection.add(rotateY(1.3, 0.47 - (0.5/10)*i, cardBottom)).link(cardSurface);
    }

    mapSection.add(new Modifier({origin: [0.5, cardBottom]})).link(goldenGateSurface);

  }
});