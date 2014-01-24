define(function(require, exports, module){

  module.exports = function(app){

    // create the section
    var splashSection = app.section('splash');
    splashSection.setOptions({
      title: 'Splash',
      navigation: {caption: 'Splash', icon: '@'}
    });

    // add the various components and logic for this section
    require('app/splashSection/splash')(splashSection);
  };
});