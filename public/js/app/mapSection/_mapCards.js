define(function(require, exports, module){
  var
    Surface       = require('./customSurface'),
    Modifier      = require('famous/Modifier'),
    Matrix        = require('famous/Matrix'),
    ViewSequence  = require('famous/ViewSequence'),
    Scrollview    = require('./customScrollView'),
    RenderNode    = require('./customRenderNode');

  /////////////////
  //// OPTIONS ////
  /////////////////
  var
    cardWidth   = Math.min(window.innerWidth/3, window.innerHeight/5);
    cardSize     = [cardWidth, cardWidth * 1.5],   // [X, Y] pixels in dimension (cards also have a 10px border at the moment)
    cardBottom   = 1,        // absolute percentage between the bottom of the cards and the bottom of the page
    rotateYAngle = 1,         // rotational Y angle of skew
    cardOffset   = 0.25,        // offset between skewed cards and the front facing card
    curve        = 'easeInOut',    // transition curve type
    easeDuration = 150,         // amount of time for cards to transition
    zPosFaceCard = 200,         // z position offset for the face card
    yPosFaceCard = -20,         // y position offset for the face card
    cardSpacing  = -cardSize[0] * 0.5;

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
        rendernode.object[0].object.setProperties({
          boxShadow: '3px 3px 3px black'
        });
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

  module.exports = function(mapSection, Engine, eventHandler){

    // create a surface to prevent the map from being clickable
    var blockingSurface = new Surface({
      size: [window.innerWidth, window.innerHeight*0.18],
      classes: ['blocker']
    });

    var blockingMod = new Modifier({
      transform: Matrix.translate(0, window.innerHeight - window.innerHeight*0.18, 1)
    });

    mapSection.add(blockingMod).link(blockingSurface);

    var centerIndex = Math.floor((window.innerWidth / Math.abs(cardSpacing)) / 2)

    var
      cardSurfaces = [],
      currentFace,
      renderNode;

    eventHandler.on('focusCard', function(id){
      var clickedCardIndex;
      var currentCardIndex = scrollview.getCurrentNode().index;
      for(var i = 0; i < cardSurfaces.length; i++){
        if(cardSurfaces[i].id === id){
          clickedCardIndex = i;
          break;
        }
      }
      console.log('clicked card is ' + clickedCardIndex);
      console.log('current card is ' + currentCardIndex);
      console.log('change amount should be ' + scrollview.getSize()[0] * amount);
      var amount = clickedCardIndex - currentCardIndex;
      scrollview.setPosition(scrollview.getSize()[0] * amount);
      setFace(clickedCardIndex);
    });

    window.scrollview = new Scrollview({
      itemSpacing: cardSpacing,
      clipSize: 0.01,
      margin: window.innerWidth,
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

      if(cardSurfaces[faceIndex]){
        eventHandler.emit('focus', cardSurfaces[faceIndex].id);
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
      transform: Matrix.translate(0, 0, 20),
      origin: [0.5,1]
    }))
    .link(scrollview);

    var removeCard = function(id){
      for(var i = 0; i < cardSurfaces.length; i++){
        if(cardSurfaces[i].id === id){
          // if the angle is "center", that means this card was the face card and we need to set a new face.
          if(cardSurfaces[i].angle === "center"){

            setTimeout(function(){
              setFace(0);
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