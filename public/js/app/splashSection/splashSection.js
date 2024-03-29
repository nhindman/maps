define(function(require, exports, module){

  var 
    RenderNode       = require('famous/RenderNode'),
    Surface          = require('famous/Surface'),
    Modifier         = require('famous/Modifier'),
    Matrix           = require('famous/Matrix'),
    Transitionable   = require('famous/Transitionable'),
    WallTransition   = require('famous-physics/utils/WallTransition'),
    SpringTransition = require('famous-physics/utils/SpringTransition'),
    PhysicsEngine    = require('famous-physics/PhysicsEngine'),
    Walls            = require('famous-physics/constraints/Walls'),
    VectorField      = require('famous-physics/forces/VectorField'),
    Vector           = require('famous-physics/math/Vector');
    // Drag             = require('famous-physics/forces/Drag');

  Transitionable.registerMethod('wall', WallTransition);
  Transitionable.registerMethod('spring', SpringTransition);

  module.exports = function(eventHandler){

    var splashNode = new RenderNode();

    ////////////////
    // BACKGROUND //
    ////////////////

    var splashSurface = new Surface({
      size: [window.innerWidth, window.innerHeight],
      classes: ['splash-back'],
      properties: {
        opacity: 0.1
      }
    });
    splashNode.add(splashSurface);

    /////////////
    // BUTTONS //
    /////////////

    var currentActive;

    var buttonContainer = new RenderNode();

    var buttonSize = [window.innerWidth/4, Math.min(window.innerWidth/4, window.innerHeight/6)]

    var sightsButton = new Surface({
      size: buttonSize,
      classes: ['splash-button', 'splash-button-sights'],
      content: '<button><i class="icon-picture"></i><div>Sights</div></button>'
    });
    buttonContainer.add(sightsButton);
    sightsButton.on('click', function(){
      if(currentActive && currentActive === sightsButton){
        return;
      }
      sightsButton.addClass('splash-button-active');
      currentActive && currentActive.removeClass('splash-button-active');
      currentActive = sightsButton;
      window.category = 'sights';
      dropBall('sights');
    });

    var foodButton = new Surface({
      size: buttonSize,
      classes: ['splash-button', 'splash-button-food'],
      content: '<button><i class="icon-food"></i><div>Food</div></button>'
    });
    buttonContainer.add(new Modifier(Matrix.translate(window.innerWidth/4, 0, 0))).link(foodButton);
    foodButton.on('click', function(){
      if(currentActive && currentActive === foodButton){
        return;
      }
      foodButton.addClass('splash-button-active');
      currentActive && currentActive.removeClass('splash-button-active');
      currentActive = foodButton;
      window.category = 'food';
      dropBall('food');
    });

    var artsButton = new Surface({
      size: buttonSize,
      classes: ['splash-button', 'splash-button-arts'],
      content: '<button><i class="icon-art-gallery"></i><div>Arts</div></button>'
    });
    buttonContainer.add(new Modifier(Matrix.translate(window.innerWidth/2,0,0))).link(artsButton);
    artsButton.on('click', function(){
      if(currentActive && currentActive === artsButton){
        return;
      }
      artsButton.addClass('splash-button-active');
      currentActive && currentActive.removeClass('splash-button-active');
      currentActive = artsButton;
      window.category = 'arts';
      dropBall('arts');
    });

    var shopButton = new Surface({
      size: buttonSize,
      classes: ['splash-button', 'splash-button-shop'],
      content: '<button><i class="icon-shop"></i><div>Shop</div></button>'
    });
    buttonContainer.add(new Modifier(Matrix.translate((window.innerWidth*3)/4,0,0))).link(shopButton);
    shopButton.on('click', function(){
      if(currentActive && currentActive === shopButton){
        return;
      }
      shopButton.addClass('splash-button-active');
      currentActive && currentActive.removeClass('splash-button-active');
      currentActive = shopButton;
      window.category = 'shop';
      dropBall('shop');
    });


    var buttonModifier = new Modifier(Matrix.translate(0,-400,0));
    splashNode.add(buttonModifier).link(buttonContainer);

    var slideDownSplashButtons = function(){
      buttonModifier.setTransform(Matrix.identity, {method: 'spring', period: 400, dampingRatio: 0.5});
    };

    var slideUpSplashButtons = function(){
      buttonModifier.setTransform(Matrix.translate(0,-400,0), {curve: 'easeIn'});
      currentActive.removeClass('splash-button-active');
      currentActive = null;
      ballModifier = null;
    }

    slideDownSplashButtons();


    //////////
    // LOGO //
    //////////

    var logo = new Surface({
      // classes: ['logo'],
      content: '<div class="logo">poing</div><div class="slogan">everywhere you want to go</div>',
      size: [window.innerWidth*0.9, window.innerWidth*0.3]
    });

    splashNode.add(new Modifier({origin: [0.5, 0.28]})).link(logo);



    /////////////////////
    // BALL DROP LOGIC //
    /////////////////////

    var ballSize = Math.min(window.innerWidth/3, window.innerHeight/4);

    var ballModifier;
    var ballNode;

    var dropBall = function(category){
      if(ballModifier){
        releaseBall(category, true);
      } else {
        dropNewBall(category);
      }
    };

    var dropNewBall = function(category){
      var ballSurface = new Surface({
        classes: ['buttonBall', category],
        size: [ballSize, ballSize],
        properties: {
          lineHeight: ballSize + 'px',
          textAlign: 'center'
        },
        content: 'GO'
      });
      ballSurface.on('click', function(){
        switchPage(category);
      });
      ballModifier = new Modifier({
        transform: Matrix.translate(0,-400,0),
        origin: [0.5, 0.78]
      });
      ballModifier.setTransform(Matrix.identity, {
        method: 'wall',
        period: 500,
        dampingRatio: .1
      });
      ballNode = splashNode.add(ballModifier).link(ballSurface);
    }

    var mapExists = false;
    var previousCategory;

    var switchPage = function(targetCategory){
      releaseBall();
      slideUpSplashButtons();
      addSpinner();
      var vent = !mapExists ? 'loadmap' : targetCategory === previousCategory ? 'swap' : 'switchCategory';
      if(vent === 'loadmap'){
        setTimeout(function(){
          eventHandler.emit(vent);
          mapExists = true;
        }, 1000)
      } else {
        eventHandler.emit(vent);
      }
      previousCategory = targetCategory;
    };


    var releaseBall = function(category, drop){
      // drop is a boolean. If true, a new ball is dropped.

      ballModifier.halt();
      var ballIndex = splashNode.get().indexOf(ballNode);
      ballModifier.setTransform(Matrix.translate(0, window.innerWidth+400, 0), {
        curve: 'easeOut',
        duration: 500,
        period: 400,
        dampingRatio: 1
      }, function(){
        splashNode.get().splice(ballIndex, 1);
        drop && dropNewBall(category);
      });
    }

    /////////////
    // SPINNER //
    /////////////

    var spinner;

    var addSpinner = function(){
      spinner = splashNode.add(new Surface({
        content: '<i class="icon-spin4 animate-spin"></i>',
        properties: {
          color: '#ccc',
          fontSize: '2em'
        }
      }))
    }

    var removeSpinner = function(){
      splashNode.get().splice(splashNode.get().indexOf(spinner), 1);
    };


    ////////////
    // EVENTS //
    ////////////

    eventHandler.on('removeSpinner',          removeSpinner)
    eventHandler.on('slideDownSplashButtons', slideDownSplashButtons);
    eventHandler.on('slideUpSplashButtons',   slideUpSplashButtons);

    return splashNode;
  };
});