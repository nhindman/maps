define(function(require, exports, module){

  var EventHandler = require('famous/EventHandler');

  module.exports = function(app, FamousEngine){

    // create the section
    var mapSection = app.section('map');
    mapSection.setOptions({
      title: 'poing',
      navigation: {caption: 'Map', icon: '@'}
    });

    var eventHandler = new EventHandler();

    // add the various components and logic for this section
    require('app/mapSection/_mapCards')(mapSection, FamousEngine, eventHandler);
    require('app/mapSection/_googleMaps')(mapSection, eventHandler);

  }
});