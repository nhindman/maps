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


    //////////
    // LOGO //
    //////////

    var logo = new Surface({
      // classes: ['logo'],
      content: '<div class="logo">poing</div><div class="slogan">everywhere you want to go</div>',
      size: [window.innerWidth*0.9, window.innerWidth*0.3]
    });

    // splashNode.add(new Modifier({origin: [0.5, 0.28]})).link(logo);
    splashNode.add(new Modifier({origin: [0.5, 0.28]})).link(logo);

    //////////////////
    // BALL SURFACE //
    //////////////////

    var ballSize = Math.min(window.innerWidth/3, window.innerHeight/4)
    var buttonSurface = new Surface({
      classes: ['buttonBall', 'buttonBall-active'],
      // content: '<button class="buttonBall"></button>',
      size: [ballSize, ballSize],
      properties: {
        lineHeight: ballSize + 'px',
        textAlign: 'center'
      },
      content: 'GO'
    });


  var wallModifier = new Modifier({
    transform: Matrix.translate(0,-400,0),
    origin: [0.5, 0.5]
  });
  wallModifier.setTransform(Matrix.translate(0,window.innerWidth*0.28,0), {method : 'wall', period : 500, dampingRatio : .1})
  splashNode.add(wallModifier).link(buttonSurface);

  
  buttonSurface.on('click', function(){
    // PE.detach(wallID);
    dropBall();
    setTimeout(function(){
      eventHandler.emit('loadmap');
    }, 1000)                          // adding a map causes the ball animation to slow down
    splashNode.add(new Surface({
      content: '<i class="icon-spin4 animate-spin"></i>',
      properties: {
        color: '#ccc',
        fontSize: '2em'
      }
    }))
  });

  var dropBall = function(){
    wallModifier.setTransform(Matrix.translate(0, window.innerWidth - ballSize/1.25, 0), {
      method: 'wall',
      period: 500,
      dampingRatio: .1
    });
    buttonSurface.removeClass('buttonBall-active');
    buttonSurface.setContent('');
  }

  // var 


    // comment out this next line and uncomment everything under physics options to enable physics effects
    // splashNode.add(new Modifier({origin: [0.5, 0.78]})).link(buttonSurface);


    /////////////////////
    // PHYSICS OPTIONS //
    /////////////////////

    // var PE = new PhysicsEngine({constraintSteps : 4});
    // var
    //   wallRestitution = 0.5,
    //   gravityStrength = 0.01,
    //   bounceStrength  = 0.12;


    /////////////
    // PHYSICS //
    /////////////


    // var buttonBall = PE.createBody({
    //   size: [ballSize, ballSize],
    //   // m : 1,
    //   r: ballSize/2,
    //   p: [window.innerWidth/2,-400,0],
    //   v: [0,0,0]
    // });

    // buttonBall.link(buttonSurface);


    // window.walls = new Walls({
    //   // restitution: wallRestitution,
    //   origin: [0.5, 0.28, 0.5]
    // });
    // var gravity = new VectorField({
    //   name: VectorField.FIELDS.CONSTANT,
    //   strength: gravityStrength
    // });
    // var reduceRestitution = function(restitution){
    //   walls.setOpts({restitution: restitution});
    //   if(restitution >= 0){
    //     setTimeout(function(){
    //       reduceRestitution(restitution*0.95 - 0.005);
    //     }, 40)
    //   } else {
    //     // Load map after ball stops bouncing
    //     eventHandler.emit('loadmap');
    //     buttonSurface.addClass('buttonBall-active');
    //     buttonSurface.setContent('GO');
    //   }
    // }










    // var wallID = PE.attach([walls, gravity])[0];

    // splashNode.add(PE);
    // reduceRestitution(wallRestitution);




    //////////////////////////
    // BALL BOUNCE ON CLICK //
    //////////////////////////

    // console.log(logo)
    // logo.on('click', function(){
      // window.transform = function(){
      //   wallModifier.setTransform(wallModifier.getFinalTransform(), {method: 'spring', period: 400, dampingRatio: 0.5, v: -10})
      // }
      // reduceRestitution(wallRestitution*2);
    // });


    return splashNode;
  };
});