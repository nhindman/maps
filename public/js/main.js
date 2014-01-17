define(function(require, exports, module) {
  var FamousEngine = require('famous/Engine');
  var App = require('app/App');

  // create the App from the template
  var app = new App();


  // create a display context and hook in the App
  var mainDisplay = FamousEngine.createContext();
  mainDisplay.setPerspective(500);
  mainDisplay.link(app);
  FamousEngine.pipe(app);

  // create the various sections
  require('app/mapSection/main')(app);

  // start on the main section
  app.select('map');
});