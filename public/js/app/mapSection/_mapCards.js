define(function(require, exports, module){

  // require modules
  var
    Surface  = require('famous/Surface'),
    Modifier = require('famous/Modifier'),
    Matrix   = require('famous/Matrix');

  // helper function to handle rotation and position
  var rotatePos = function(theta, x, y){
    return new Modifier({
      transform: Matrix.rotateY(theta),
      origin: [x, y]
    });
  };

  module.exports = function(mapSection){


    // options
    var
      cardSize   = [80, 120],
      cardBottom = 0.95;

    // create the golden gate bridge at the center
    var goldenGateSurface = new Surface({
      size: cardSize,
      properties: {
        backgroundImage: 'url(http://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Golden_Gate_Bridge_20100906_04.JPG/80px-Golden_Gate_Bridge_20100906_04.JPG)'
      },
      classes: ['card']
    });
    mapSection.add(new Modifier({origin: [0.5, cardBottom]})).link(goldenGateSurface);
    
    // create objects to the left of center
    var cardSurface;
    for(var i = 1; i < 11; i++){
      cardSurface = new Surface({
        size: cardSize,
        properties: {
          backgroundColor: 'steelblue'
        },
        classes: ['card']
      });
      mapSection.add(rotatePos(-1.3, 0.53 + (0.5/10)*i, cardBottom)).link(cardSurface);
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
      mapSection.add(rotatePos(1.3, 0.47 - (0.5/10)*i, cardBottom)).link(cardSurface);
    }

  }
});