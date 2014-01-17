define(function(require, exports, module){

  module.exports = function(app){

    // create the section
    var mapSection = app.section('map');
    mapSection.setOptions({
      title: 'Map',
      navigation: {caption: 'Map', icon: '@'}
    });

    // add the various components and logic for this section
    require('app/mapSection/map')(mapSection);
    require('app/mapSection/mapCards')(mapSection);

  }
});