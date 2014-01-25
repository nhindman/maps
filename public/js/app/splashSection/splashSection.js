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
      }
      // content: 'GO'
    });

    buttonSurface.on('click', function(){
      PE.detach(wallID);
      eventHandler.emit('swap');
    });

    // comment out this next line and uncomment everything under physics options to enable physics effects
    // splashNode.add(new Modifier({origin: [0.5, 0.78]})).link(buttonSurface);


    /////////////////////
    // PHYSICS OPTIONS //
    /////////////////////

    var PE = new PhysicsEngine({constraintSteps : 4});
    var
      wallRestitution = 0.5,
      gravityStrength = 0.01,
      bounceStrength  = 0.12;


    /////////////
    // PHYSICS //
    /////////////


    var buttonBall = PE.createBody({
      size: [ballSize, ballSize],
      // m : 1,
      r: ballSize/2,
      p: [window.innerWidth/2,-400,0],
      v: [0,0,0]
    });

    buttonBall.link(buttonSurface);


    window.walls = new Walls({
      // restitution: wallRestitution,
      origin: [0.5, 0.28, 0.5]
    });
    var gravity = new VectorField({
      name: VectorField.FIELDS.CONSTANT,
      strength: gravityStrength
    });
    var reduceRestitution = function(restitution){
      walls.setOpts({restitution: restitution});
      if(restitution >= 0){
        setTimeout(function(){
          reduceRestitution(restitution*0.95 - 0.005);
        }, 40)
      } else {
        console.log('loadmap');
        buttonSurface.addClass('buttonBall-active');
        buttonSurface.setContent('GO');
        eventHandler.emit('loadmap');
      }
    }

    var wallID = PE.attach([walls, gravity])[0];

    splashNode.add(PE);
    reduceRestitution(wallRestitution);

    // var drag = new Drag();

    // PE.attach(drag, buttonBall);

    // var increaseDrag = function(dragAmount){
    //   console.log(dragAmount);
    //   drag.setOpts({strength: dragAmount});
    //   if(dragAmount < 0.11){
    //     setTimeout(function(){
    //       increaseDrag(dragAmount + 0.01);
    //     }, 100)
    //   }
    // };

    // increaseDrag(0.001);



    //////////////////////////
    // BALL BOUNCE ON CLICK //
    //////////////////////////


    logo.on('click', function(){
      buttonBall.applyForce(new Vector(0,-bounceStrength, 0));
      reduceRestitution(wallRestitution*2);
    });


    return splashNode;
  };
});