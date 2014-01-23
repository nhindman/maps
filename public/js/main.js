define(function(require, exports, module) {
  var
    FamousEngine = require('famous/Engine'),
    App          = require('app/App'),
    Scrollview = require('famous-views/ScrollView'),
    Surface = require('famous/Surface'),
    RenderNode = require('app/mapSection/customRenderNode'),
    Modifier = require('famous/Modifier'),
    Matrix = require('famous/Matrix')

  // create the App from the template
  var app = new App();

  // create a display context and hook in the App
  var mainDisplay = FamousEngine.createContext();
  mainDisplay.setPerspective(2000);
  // mainDisplay.link(app);
  FamousEngine.pipe(app);

  // create the various sections
  // require('app/splashSection/splashSection')(app);
  // mainDisplay.link(splashSection);
  // console.log(map);

  // start on the main section
  // app.select('map');

  //Create a scrollview
  var displays = [];
  var
    splashSurface,
    spashNode,
    height = window.innerHeight,
    width = window.innerWidth,
    mod;
  mod = new Modifier({
    // transform: Matrix.rotateY(1)
  });
  var mod2 = new Modifier({
    transform: Matrix.translate(0, 0, -30)
  });
  window.swap = function(){
    mod.setTransform(Matrix.translate(500, 0, -20), {duration: 250});
    mod2.setTransform(Matrix.translate(-500, 0, 20), {duration: 250}, secondSwap);
  }
  var secondSwap = function(){
    mod.setTransform(Matrix.translate(window.innerWidth/2, 0, -60), {duration: 150});
    mod2.setTransform(Matrix.translate(0, 0, 0), {duration: 500}, thirdSwap)
   };
  var thirdSwap = function(){
    mod.setTransform(Matrix.translate(-window.innerWidth/1000, 0, -100), {duration: 150});
  };
  window.swapBack = function(){
    mod.setTransform(Matrix.translate(-500, 0, 20), {duration: 250});
    mod2.setTransform(Matrix.translate(500, 0, -20), {duration: 250}, secondSwapBack);
  };
  var secondSwapBack = function(){
    mod.setTransform(Matrix.translate(0, 0, 0), {duration: 500})
    mod2.setTransform(Matrix.translate(window.innerWidth/2, 0, -60), {duration: 150}, thirdSwapBack);
  };
  var thirdSwapBack = function(){
    mod2.setTransform(Matrix.translate(-window.innerWidth/1000, 0, -100), {duration: 150});
  };
  displays.push(new Surface({
      content: '<img src="./js/app/splashSection/san-francisco-morning-fog.jpg"/>',
      size: [window.innerWidth, window.innerHeight],
    }))
  require('app/mapSection/_googleMaps')(displays);
  // for (i = 0; i < displays.length; i++) {
    // mainDisplay.add(mod).link(displays[0]);
    mainDisplay.add(mod).link(displays[1]);
    mainDisplay.add(mod2).link(displays[0]);
  // }

});