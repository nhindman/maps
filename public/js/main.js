define(function(require, exports, module) {
  var
    FamousEngine          = require('famous/Engine'),
    App                   = require('app/App'),
    Scrollview            = require('famous-views/ScrollView'),
    Surface               = require('famous/Surface'),
    RenderNode            = require('app/mapSection/customRenderNode'),
    Modifier              = require('famous/Modifier'),
    Matrix                = require('famous/Matrix'),
    EventHandler          = require('famous/EventHandler'),
    Transitionable        = require('famous/Transitionable'),
    StiffSpringTransition = require('famous-physics/utils/StiffSpringTransition');



  var eventHandler = new EventHandler();


  Transitionable.registerMethod('stiffSpring', StiffSpringTransition);
  // Transitionable.registerMethod('wall', WallTransition);


  // create a display context and hook in the App
  var mainDisplay = FamousEngine.createContext();
  mainDisplay.setPerspective(2000);

  var
    splashSurface,
    splashNode,
    height = window.innerHeight,
    width = window.innerWidth,
    mod,
    mod2;
  mod = new Modifier({
    transform: Matrix.translate(0, 0, 0)
  });
  mod2 = new Modifier({
    transform: Matrix.translate(window.innerWidth*1.2, 0, -100)
  });

  var mapNode = require('app/mapSection/_googleMaps')(mainDisplay, eventHandler);
  var splashNode = require('app/splashSection/splashSection')(eventHandler);
  var swap = function(){
    mod.setTransform(Matrix.translate(-window.innerWidth, 0, 200), {duration: 1000, method: 'stiffSpring', period: 400, dampingRatio: 0.7});
    mod2.setTransform(Matrix.translate(0, 0, 0), {duration: 1000, method: 'stiffSpring', period: 400, dampingRatio: 0.7}, secondSwap)
  }
  var secondSwap = function(){
    scrollmod = mapNode.object[3].modifiers[0];
    scrollmod.setTransform(Matrix.translate(0, -30, 0), {duration: 400, method: 'stiffSpring'});
    eventHandler.emit('slideDownHeader');
   };

  var swapBack = function(){
    scrollmod.setTransform(Matrix.translate(0, window.innerHeight, 60), {duration: 400, curve: 'easeOut'}, secondSwapBack);
  };

  var secondSwapBack = function(){
    mod.setTransform(Matrix.translate(0, 0, 0), {duration: 1000, method: 'stiffSpring', period: 400, dampingRatio: 0.7})
    mod2.setTransform(Matrix.translate(-window.innerWidth, 0, 200), {duration: 1000, method: 'stiffSpring', period: 400, dampingRatio: 0.7})
  };

  mainDisplay.add(mod).link(splashNode);


  eventHandler.on('loadmap', function(category){
    mainDisplay.add(mod2).link(mapNode);
  });

  eventHandler.on('swap', function(){
    setTimeout(function(){
      swap();
    }, 500)
  });

  eventHandler.on('swapBack', swapBack);


});