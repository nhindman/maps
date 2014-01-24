define(function(require, exports, module) {
  var
    FamousEngine = require('famous/Engine'),
    App          = require('app/App'),
    Scrollview = require('famous-views/ScrollView'),
    Surface = require('famous/Surface'),
    RenderNode = require('app/mapSection/customRenderNode'),
    Modifier = require('famous/Modifier'),
    Matrix = require('famous/Matrix'),
    EventHandler = require('famous/EventHandler'),
    eventHandler = new EventHandler();

  // create the App from the template
  var app = new App();

  // create a display context and hook in the App
  var mainDisplay = FamousEngine.createContext();
  mainDisplay.setPerspective(2000);
  FamousEngine.pipe(app);

  var
    splashSurface,
    spashNode,
    height = window.innerHeight,
    width = window.innerWidth,
    mod,
    mod2;
  mod = new Modifier({
    transform: Matrix.translate(0, 0, 0)
  });
  mod2 = new Modifier({
    transform: Matrix.translate(window.innerWidth/1000, 0, -100)
  });
  var mapNode = require('app/mapSection/_googleMaps')(mainDisplay, eventHandler);
  window.swap = function(){
    mod.setTransform(Matrix.move(Matrix.rotateY(-0.05),[250, 0, -50]), {duration: 400, curve: 'easeOut'});
    mod2.setTransform(Matrix.move(Matrix.rotateY(0.05), [-950, 0, 50]), {duration: 400, curve: 'easeOut'}, secondSwap);
    scrollmod.setTransform(Matrix.translate(0, 0, 0), {duration: 400});
  }
  var secondSwap = function(){
    mod.setTransform(Matrix.move(Matrix.rotateY(-0.05), [0, 0, -100]), {duration: 400, curve: 'easeIn'});    
    mod2.setTransform(Matrix.translate(0, 0, 0), {duration: 400, curve: 'easeIn'})
   };

  window.swapBack = function(){
    mod.setTransform(Matrix.move(Matrix.rotateY(0.05), [250, 0, 50]), {duration: 400, curve: 'easeOut'});
    mod2.setTransform(Matrix.move(Matrix.rotateY(-0.05), [-950, 0, -50]), {duration: 400, curve: 'easeOut'}, secondSwapBack);
    scrollmod.setTransform(Matrix.translate(0, -height, 0), {duration: 400});
  };
  var secondSwapBack = function(){
    mod.setTransform(Matrix.translate(0, 0, 0), {duration: 400, curve: 'easeIn'})
    mod2.setTransform(Matrix.move(Matrix.rotateY(-0.05), [0, 0, -100]), {duration: 400, curve: 'easeIn'});
  };
  // var thirdSwapBack = function(){
  //   mod2.setTransform(Matrix.translate(window.innerWidth/1000, 0, -100), {duration: 400});
  // };
  var placeholder = new Surface({
      content: '<img src="./js/app/splashSection/splash.png" height=' + height + ' width=' + width + ' />',
      size: [window.innerWidth, window.innerHeight],
  });
  mainDisplay.add(mod).link(placeholder);
  mainDisplay.add(mod2).link(mapNode);
  scrollmod = mapNode.object[2].modifiers[0];
  placeholder.on('touchend', swap);

});