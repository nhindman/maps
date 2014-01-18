define(function(require, exports, module){

  module.exports = function(app, FamousEngine){

    // create the section
    var mapSection = app.section('map');
    mapSection.setOptions({
      title: 'Map',
      navigation: {caption: 'Map', icon: '@'}
    });

    // add the various components and logic for this section
    // require('app/mapSection/_googleMaps')(mapSection);
    require('app/mapSection/_mapCards')(mapSection, FamousEngine);

  }
});