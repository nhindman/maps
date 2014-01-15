define(function(require, exports, module) {
    var FamousEngine = require('famous/Engine');
    var App = require('app/App');

    var Surface = require('famous/Surface');

    // create the App from the template
    var myApp = new App();

    // create a display context and hook in the App
    var mainDisplay = FamousEngine.createContext();
    mainDisplay.link(myApp);
    FamousEngine.pipe(myApp);

    // create a section
    var mySection = myApp.section('main');
    mySection.setOptions({
        title: 'Main',
        navigation: {caption: 'Main', icon: '@'}
    });
    
    // create an example surface 
    var mySurface = new Surface({
        properties: { 'padding': '20px' },
        content: '<h2>Hello World</h2><p>Lorem ipsum sit dolor amet &hellip;</p>'
    });

    // link the surface into the setion
    mySection.link(mySurface);

    // start on the main section
    myApp.select('main');
});
