define(function(require, exports, module) {
  var
    FamousEngine = require('famous/Engine'),
    App          = require('app/App'),
    Scrollview   = require('famous-views/ScrollView'),
    Surface      = require('famous/Surface'),
    RenderNode   = require('app/mapSection/customRenderNode'),
    Modifier     = require('famous/Modifier'),
    Matrix       = require('famous/Matrix'),
    EventHandler = require('famous/EventHandler'),
    eventHandler = new EventHandler();


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
  window.swap = function(){
    mod.setTransform(Matrix.move(Matrix.rotateY(0),[-window.innerWidth, 0, 200]), {duration: 500, curve: 'easeOutBounce'});
    // mod2.setTransform(Matrix.move(Matrix.rotateY(0.05), [window.innerWidth*0.7, 0, -500]), {duration: 500, curve: 'easeOut'}, secondSwap);
    mod2.setTransform(Matrix.translate(0, 0, 0), {duration: 500, curve: 'easeOutBounce'}, secondSwap)
  }
  var secondSwap = function(){
    // mod.setTransform(Matrix.move(Matrix.rotateY(0), [-window.innerWidth, 0, 400]), {duration: 700, curve: 'easeOut'});    
    // mod2.setTransform(Matrix.translate(0, 0, 0), {duration: 700, curve: 'easeOutBounce'}, emitQuery)
    scrollmod.setTransform(Matrix.translate(0, 0, 0), {duration: 400, curve: 'easeOutBounce'});
   };

  window.swapBack = function(){
    mod.setTransform(Matrix.move(Matrix.rotateY(0.05), [250, 0, 50]), {duration: 700, curve: 'easeOut'});
    mod2.setTransform(Matrix.move(Matrix.rotateY(-0.05), [-950, 0, -50]), {duration: 700, curve: 'easeOut'}, secondSwapBack);
    scrollmod.setTransform(Matrix.translate(0, -height, 0), {duration: 700});
  };
  var secondSwapBack = function(){
    mod.setTransform(Matrix.translate(0, 0, 0), {duration: 700, curve: 'easeIn'})
    mod2.setTransform(Matrix.move(Matrix.rotateY(-0.05), [0, 0, -100]), {duration: 700, curve: 'easeIn'});
  };
  // var thirdSwapBack = function(){
  //   mod2.setTransform(Matrix.translate(window.innerWidth/1000, 0, -100), {duration: 400});
  // };

  mainDisplay.add(mod).link(splashNode);

  // var emitQuery = function(){
  //   eventHandler.emit('startQuery');
  // }


  eventHandler.on('loadmap', function(){
    mainDisplay.add(mod2).link(mapNode);
  });

  eventHandler.on('swap', function(){
    setTimeout(function(){
      swap();
    }, 500)
  })

  scrollmod = mapNode.object[2].modifiers[0];

});