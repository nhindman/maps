define(function(require, exports, module){

  var
    Surface  = require('famous/Surface'),
    Modifier = require('famous/Modifier'),
    Matrix = require('famous/Matrix');

  module.exports = function(mapSection){
    var
      cardSize   = [80, 120],
      cardBottom = 0.95;

    var goldenGateSurface = new Surface({
      size: cardSize,
      properties: {
        backgroundImage: 'url(http://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Golden_Gate_Bridge_20100906_04.JPG/80px-Golden_Gate_Bridge_20100906_04.JPG)'
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