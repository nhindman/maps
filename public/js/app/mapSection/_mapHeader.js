define(function(require, exports, module){

  var RenderNode = require('famous/RenderNode');
  var Surface = require('famous/Surface');
  var Modifier = require('famous/Modifier');
  var Matrix = require('famous/Matrix');
  var Transitionable = require('famous/Transitionable');
  var SpringTransition = require('famous-physics/utils/SpringTransition');

  Transitionable.registerMethod('spring', SpringTransition);

  module.exports = function(mapNode, eventHandler){

    var headerNode = new RenderNode();
    var headerSurface = new Surface({
      size: [window.innerWidth, 50],
      content: category,
      classes: ['map-header', category]
    });
    var headerModifier = new Modifier(Matrix.translate(0,-50,40));
    headerNode.add(headerModifier).link(headerSurface);

    var headerButton = new Surface({
      size: [50, 50],
      content: '<button class="header-button"><i class="icon-left-circle"></i></button>'
    });
    headerNode.add(headerModifier).link(headerButton);

    headerButton.on('click', function(){
      eventHandler.emit('swapBack');
    });

    var slideUpHeader = function(){
      headerModifier.setTransform(Matrix.translate(0,-50,40), {
        method: 'spring',
        period: 500,
        dampingRatio: 0.5
      });
    };

    var slideDownHeader = function(){
      headerModifier.setTransform(Matrix.translate(0,0,40), {
        method: 'spring',
        period: 500,
        dampingRatio: 0.5
      });
    };

    eventHandler.on('slideDownHeader', slideDownHeader);
    eventHandler.on('slideUpHeader',   slideUpHeader);

    mapNode.add(headerNode);

  }
});