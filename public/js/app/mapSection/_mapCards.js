var data = [];

define(function(require, exports, module){
  var
    Surface      = require('./customSurface'),
    Modifier     = require('famous/Modifier'),
    Matrix       = require('famous/Matrix'),
    ViewSequence = require('famous/ViewSequence'),
    Scrollview = require('./customScrollView'),
    RenderNode = require('./customRenderNode'),
    App = require('../App');

  /////////////////
  //// OPTIONS ////
  /////////////////
  var
    cardSize     = [80, 120],   // [X, Y] pixels in dimension (cards also have a 10px border at the moment)
    cardBottom   = 0.95,        // absolute percentage between the bottom of the cards and the bottom of the page
    rotateYAngle = 1,         // rotational Y angle of skew
    cardOffset   = 0.25,        // offset between skewed cards and the front facing card
    curve        = 'easeInOut',    // transition curve type
    easeDuration = 150,         // amount of time for cards to transition
    zPosFaceCard = 400,         // z position offset for the face card
    yPosFaceCard = -40,         // y position offset for the face card
    cardSpacing  = -50;

  //////////////////////////
  //// HELPER FUNCTIONS ////
  //////////////////////////

  // helper function to handle rotation and position
  var rotatePos = function(theta, x, y, yPos, zPos){
    yPos = yPos || 0;
    zPos = zPos || 50;
    return new Modifier({
      transform: Matrix.move(Matrix.rotateY(theta), [0, yPos, zPos]),
      origin: [x, y]
    });
  };

  // helper function to rotate positions from surfaces plus offsets
  var transformCard = function(rendernode, Xoffset, direction){
    var
      theta,
      y = 0,
      z = 50;

    switch(direction){
      case "left":
        theta = rotateYAngle;
        break;
      case "center":
        theta = 0;
        y = yPosFaceCard;
        z = zPosFaceCard;
        break;
      case "right":
        theta = -rotateYAngle;
        break;
    }
    rendernode.angle = direction;
    var mod = rendernode.object[0].modifiers[0];
    if (mod) {
      mod.halt();
      mod.setTransform(Matrix.move(Matrix.rotateY(theta), [0,y,z]), {
        duration: easeDuration,
        curve: curve
      });
      // mod.setOrigin([Xoffset, cardBottom], {
      //   duration: easeDuration,
      //   curve: curve
      // });
    }
  }

  module.exports = function(mapSection, Engine){

    // storage for our various surfaces and modifiers
    var centerIndex = Math.floor((window.innerWidth / Math.abs(cardSpacing)) / 2)

    var
      cardSurfaces = [],
      currentFace,
      scrollview = new Scrollview({
        itemSpacing: cardSpacing,
        clipSize: window.innerWidth/5,
        speedLimit: 1.3
        // edgePeriod: 150
      }, function(pos){
        var faceIndex = Math.min(data.length - 1, scrollview.getCurrentNode().get().index)
        setFace(faceIndex);
      }),
      renderNode;

    currentFace = 0;

    var addCard = function(location){
      data.push(location);
      var options = {
        size: cardSize,
        content: location.name,
        classes: ['card'],
        properties: {
          backgroundImage: "url(" + location.photo + ")",
          backgroundSize: "80px"
        }
      }
      var index = data.length - 1;
      var cardSurface = new Surface(options);
      var renderNode = new RenderNode({ index: index });
      var rotation = index > currentFace ? -rotateYAngle : 0;

      var modifier = new Modifier({
        transform: Matrix.rotateY(rotation)
      });
      cardSurface.pipe(renderNode);
      renderNode.add(modifier).link(cardSurface);
      cardSurfaces.push(renderNode);
    };
    // createCards(1);
    setTimeout(function(){
      scrollview.sequenceFrom(cardSurfaces);
    }, 10000);
    // Engine.pipe(scrollview);
    mapSection
    .add(new Modifier({
      transform: Matrix.translate(window.innerWidth/2 - cardSize[0]/3, window.innerHeight*0.7, 0)
    }))
    .link(scrollview);

    var removeCard = function(){

    }

    var setFace = function(faceIndex){
      if(currentFace === faceIndex){
        return;
      }
      var
        increment = 1 / (data.length - 1),
        Xoffset;

      cardSurfaces.forEach(function(rendernode, index){
        if(index < faceIndex && rendernode.angle !== "left"){
          Xoffset = 0;
          // Xoffset = (increment * index * (1 - cardOffset));
          transformCard(rendernode, Xoffset, "left");
        }

        if(index === faceIndex && rendernode.angle !== "center"){
          Xoffset = 0;
          // Xoffset = (increment * index);
          transformCard(rendernode, Xoffset, "center");
        }

        if(index > faceIndex && rendernode.angle !== "right"){
          Xoffset = 0;
          // Xoffset = (increment * index) * (1 - cardOffset) + cardOffset;
          transformCard(rendernode, Xoffset, "right")
        }
      })
      currentFace = faceIndex;
    };

    return {
      addCard: addCard
    }
  };
});