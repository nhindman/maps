define(function(require, exports, module) {
  var FamousEngine = require('famous/Engine');
  var App = require('app/App');



  // create the App from the template
  var myApp = new App();

  // create a display context and hook in the App
  var mainDisplay = FamousEngine.createContext();
  mainDisplay.link(myApp);
  FamousEngine.pipe(myApp);

  // create the various sections
  require('map')(myApp);
  require('first')(myApp);
  require('second')(myApp);

  // start on the map section
  myApp.select('map');


});