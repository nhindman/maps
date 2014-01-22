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
    cardSize     = [(window.innerWidth / 3), (window.innerWidth / 3) * 1.5],   // [X, Y] pixels in dimension (cards also have a 10px border at the moment)
    cardBottom   = 1,        // absolute percentage between the bottom of the cards and the bottom of the page
    rotateYAngle = 1,         // rotational Y angle of skew
    cardOffset   = 0.25,        // offset between skewed cards and the front facing card
    curve        = 'easeInOut',    // transition curve type
    easeDuration = 150,         // amount of time for cards to transition
    zPosFaceCard = 200,         // z position offset for the face card
    yPosFaceCard = -100,         // y position offset for the face card
    cardSpacing  = -cardSize[0]*0.5;

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
  var transformCard = function(rendernode, direction){
    var
      theta,
      y = 0,
      z = 60;

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
    }
  }

  module.exports = function(mapSection, Engine){

    // create a surface to prevent the map from being clickable
    var blockingSurface = new Surface({
      size: [window.innerWidth, window.innerHeight*0.18],
      classes: ['blocker']
    });

    var blockingMod = new Modifier({
      // origin: [0,1],
      transform: Matrix.translate(0, window.innerHeight - window.innerHeight*0.18, 1)
    });

    mapSection.add(blockingMod).link(blockingSurface);

    // storage for our various surfaces and modifiers
    var centerIndex = Math.floor((window.innerWidth / Math.abs(cardSpacing)) / 2)

    var
      cardSurfaces = [],
      currentFace,
      renderNode;

    window.scrollview = new Scrollview({
      itemSpacing: cardSpacing,
      clipSize: window.innerWidth/5,
      speedLimit: 1.3,
      drag: 0.004
      // edgePeriod: 150
    }, function(pos){
      setFace();
    });

    currentFace = 0;

    var setFace = function(faceIndex){
      faceIndex = faceIndex || Math.min(cardSurfaces.length - 1, cardSurfaces.indexOf(scrollview.getCurrentNode().get()));
      if(currentFace === faceIndex){
        return;
      }
      cardSurfaces.forEach(function(rendernode, index){
        if(index < faceIndex && rendernode.angle !== "left"){
          transformCard(rendernode, "left");
        }
        if(index === faceIndex && rendernode.angle !== "center"){
          transformCard(rendernode, "center");
        }
        if(index > faceIndex && rendernode.angle !== "right"){
          transformCard(rendernode, "right")
        }
      })
      currentFace = faceIndex;
    };

    var first = true;
    var addCard = function(location){
      var cardSurface = new Surface({
        size: cardSize,
        content: location.name,
        classes: ['card'],
        properties: {
          backgroundColor: "steelblue",
          backgroundImage: "url(" + location.photo + ")",
          backgroundSize: "auto " + cardSize[1] + "px"
          // backgroundColor: 'steelblue'
        }
      });

      var renderNode = new RenderNode({id: location.id});
      renderNode.angle = "left";
      var modifier = new Modifier({
        transform: Matrix.rotateY(-rotateYAngle)
      });
      if(!cardSurfaces.length){
        renderNode.angle = "center";
        modifier = new Modifier({
          transform: Matrix.translate([0, yPosFaceCard, zPosFaceCard])
        });
      }

      cardSurface.pipe(renderNode);
      renderNode.add(modifier).link(cardSurface);
      // renderNode.modifier = modifier;
      cardSurfaces.push(renderNode);
      if(first){
        scrollview.sequenceFrom(cardSurfaces);
        setFace(0);
        first = false;
      }
    };
    // Engine.pipe(scrollview);
    mapSection
    .add(new Modifier({
      transform: Matrix.translate(window.innerWidth/2 - cardSize[0]/3, window.innerHeight*0.75, 20)
    }))
    .link(scrollview);

    var removeCard = function(id){
      for(var i = 0; i < cardSurfaces.length; i++){
        if(cardSurfaces[i].id === id){
          // if the angle is "center", that means this card was the face card and we need to set a new face.
          if(cardSurfaces[i].angle === "center"){

            setTimeout(function(){
              setFace(0);

              // resequence the scrollview
              scrollview.sequenceFrom(cardSurfaces);
              
            }, 0)
          }
          return cardSurfaces.splice(i, 1);
        }
      }
    };

    return {
      addCard: addCard,
      removeCard: removeCard
    };
  };
});