define(function(require, exports, module){
  var Surface = require('famous/Surface');

  module.exports = function(myApp){
    var surface2 = new Surface({
      properties: {
        'padding': '20px'
      },
      content: '<div id="hi">Hi how are you</div>'
    });
    var section2 = myApp.section('second');
    section2.setOptions({
      title: 'second',
      navigation: {
        caption: 'second', icon: 'YOLO'
      }
    });
    section2.link(surface2);
  }
})