define(function(require, exports, module){

  var 
    RenderNode    = require('famous/RenderNode'),
    Surface       = require('famous/Surface'),
    Modifier      = require('famous/Modifier'),
    PhysicsEngine = require('famous-physics/PhysicsEngine'),
    Walls         = require('famous-physics/constraints/Walls'),
    VectorField   = require('famous-physics/forces/VectorField'),
    Vector        = require('famous-physics/math/Vector'),
    Drag          = require('famous-physics/forces/Drag');

  module.exports = function(eventHandler){

    var splashNode = new RenderNode();

    ////////////////
    // BACKGROUND //
    ////////////////

    var splashSurface = new Surface({
      size: [window.innerWidth, window.innerHeight],
      properties: {
        backgroundImage: 'url(/img/splashbackground.jpg)',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
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

    splashNode.add(new Modifier({origin: [0.5, 0.28]})).link(logo);


    //////////////////
    // BALL SURFACE //
    //////////////////

    var ballSize = Math.min(window.innerWidth/3, window.innerHeight/4)
    var buttonSurface = new Surface({
      classes: ['buttonBall'],
      // content: '<button class="buttonBall"></button>',
      size: [ballSize, ballSize],
      properties: {
        lineHeight: ballSize + 'px',
        // textAlign: 'center',
      },
      content: 'GO'
    });

    buttonSurface.on('click', function(){
      window.swap();
    });

    // comment out this next line and uncomment everything under physics options to enable physics effects
    splashNode.add(new Modifier({origin: [0.5, 0.78]})).link(buttonSurface);


    // /////////////////////
    // // PHYSICS OPTIONS //
    // /////////////////////

    // var PE = new PhysicsEngine({constraintSteps : 4});
    // var
    //   wallRestitution = 0.4,
    //   gravityStrength = 0.005,
    //   bounceStrength = 0.12;


    // /////////////
    // // PHYSICS //
    // /////////////


    // var buttonBall = PE.createBody({
    //   size: [ballSize, ballSize],
    //   m : 1.1,
    //   r: ballSize/2,
    //   p: [window.innerWidth/2,-400,0],
    //   v: [0,0,0]
    // });

    // buttonBall.link(buttonSurface);

    // var walls = new Walls({
    //   restitution: wallRestitution,
    //   origin: [0.5, 0.28, 0.5]
    // });
    // var gravity = new VectorField({
    //   name: VectorField.FIELDS.CONSTANT,
    //   strength: gravityStrength
    // });

    // PE.attach([walls, gravity]);

    // // splashNode.add(PE);
    // eventHandler.on('maploaded', function(){
    //   splashNode.add(PE);
    // });


    // //////////////////////////
    // // BALL BOUNCE ON CLICK //
    // //////////////////////////


    // logo.on('click', function(){
    //   buttonBall.applyForce(new Vector(0,-bounceStrength, 0));
    // });


    return splashNode;
  };
});