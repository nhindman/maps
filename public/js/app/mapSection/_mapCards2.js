define(function(require, exports, module){

  // require modules
  var
    Surface  = require('famous/Surface');
    Modifier = require('famous/Modifier');
    Matrix   = require('famous/Matrix');
    Scrollview = require('./customScrollview');
    Engine = require('famous/Engine');
    RenderNode = require('famous/RenderNode');


  // helper function to handle rotation and position
  var rotatePos = function(theta, y, z){
    return new Modifier({
      transform: Matrix.move(Matrix.rotateY(theta), [0, 0, z]),
      // origin: [x, y, z]
    });
  };

  module.exports = function(mapSection){

    var scrollview = new Scrollview({
      itemSpacing: -60
    });
    var surfaces = [];

    // options
    var
      cardSize   = [80, 120],
      cardBottom = 0.95;

    var rendernode = new RenderNode();
    // create objects to the right of center
    for(var i = 1; i < 21; i++){
      cardSurface = new Surface({
        size: cardSize,
        properties: {
          backgroundColor: 'steelblue'
        },
        classes: ['card']
      });
      rendernode = new RenderNode();
      rendernode.add(rotatePos(.5, 1, 60)).link(cardSurface);
      surfaces.push(rendernode);
    }

    // create objects to the left of center
    var cardSurface;
    for(var i = 1; i < 21; i++){
      cardSurface = new Surface({
        size: cardSize,
        properties: {
          backgroundColor: 'steelblue'
        },
        classes: ['card']
      });
      rendernode = new RenderNode();
      rendernode.link(cardSurface);
      rendernode.add(rotatePos(-.5, 1, 15)).link(cardSurface);
      surfaces.push(rendernode);
    }
    scrollview.sequenceFrom(surfaces);
    Engine.pipe(scrollview);
    mapSection.add(new Modifier({origin: [0, .95]})).link(scrollview);
  }
});