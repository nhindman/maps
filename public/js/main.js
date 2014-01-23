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
  mainDisplay.setPerspective(300);
  FamousEngine.pipe(app);

  var
    splashSurface,
    spashNode,
    height = window.innerHeight,
    width = window.innerWidth,
    displays = [],
    mod,
    mod2;
  mod = new Modifier({});
  mod2 = new Modifier({
    transform: Matrix.translate(window.innerWidth/1000, 0, -100)
  });
  window.swap = function(){
    mod.setTransform(Matrix.move(Matrix.rotateY(-0.05),[500, 0, -40]), {duration: 400, curve: 'easeOut'});
    mod2.setTransform(Matrix.move(Matrix.rotateY(0.05), [-1200, 0, 40]), {duration: 400, curve: 'easeOut'}, secondSwap);
  }
  var secondSwap = function(){
    mod.setTransform(Matrix.move(Matrix.rotateY(-0.05), [0, 0, -90]), {duration: 400, curve: 'easeIn'});    
    mod2.setTransform(Matrix.translate(0, 0, 0), {duration: 400, curve: 'easeIn'})
   };
  window.swapBack = function(){
    mod.setTransform(Matrix.move(Matrix.rotateY(0.05), [500, 0, 40]), {duration: 400, curve: 'easeOut'});
    mod2.setTransform(Matrix.move(Matrix.rotateY(-0.05), [-1200, 0, -40]), {duration: 400, curve: 'easeOut'}, secondSwapBack);
  };
  var secondSwapBack = function(){
    mod.setTransform(Matrix.translate(0, 0, 0), {duration: 400, curve: 'easeIn'})
    mod2.setTransform(Matrix.move(Matrix.rotateY(-0.05), [-window.innerWidth/2, 0, -90]), {duration: 400, curve: 'easeIn'}, thirdSwapBack);
  };
  var thirdSwapBack = function(){
    mod2.setTransform(Matrix.translate(window.innerWidth/1000, 0, -100), {duration: 400});
  };
  displays.push(new Surface({
      content: '<img src="./js/app/splashSection/san-francisco-morning-fog.jpg"/>',
      size: [window.innerWidth, window.innerHeight],
  }))
  require('app/mapSection/_googleMaps')(displays);
  mainDisplay.add(mod).link(displays[1]);
  mainDisplay.add(mod2).link(displays[0]);
});