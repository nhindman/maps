define(function(require, exports, module){
  var 
    Surface = require('famous/Surface'),
    Draggable = require('famous-modifiers/Draggable');
  module.exports = function(mainDisplay){
    var height = window.innerHeight;
    var width = window.innerWidth;
    var draggable = new Draggable();

    var splashSurface = new Surface({
      content: '<img src="js/app/splashSection/san-francisco-icon.png"/>',
    });

    // splashSurface.pipe(draggable);
    // mainDisplay.add(draggable).link(splashSurface);

    // splashSection.add(draggable).link(splashSurface);
  }
});