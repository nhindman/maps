define(function(require, exports, module){

  module.exports = function(app, FamousEngine){

    // create the section
    var mapSection = app.section('map');
    mapSection.setOptions({
      title: 'poing',
      navigation: {caption: 'Map', icon: '@'}
    });

    // add the various components and logic for this section
    var cardCallback = require('app/mapSection/_mapCards')(mapSection, FamousEngine);
    require('app/mapSection/_googleMaps')(mapSection, cardCallback);

  }
});