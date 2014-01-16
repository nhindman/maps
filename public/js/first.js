define(function(require, exports, module){
  var Surface = require('famous/Surface');
 
  module.exports = function(myApp){
	  var mySection = myApp.section('main');
	  mySection.setOptions({
	    title: 'Main',
	    navigation: {caption: 'Main', icon: '@'}
	  });
	  var mySurface = new Surface({
	    properties: { 'padding': '20px' },
	    content: '<h2>Hello World</h2><p>Lorem ipsum sit dolor amet &hellip;</p>'
	  });
	  mySection.link(mySurface);
  }
});