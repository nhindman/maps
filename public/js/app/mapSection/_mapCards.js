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
    cardSize     = [cardWidth, cardWidth * 1.5],   // [X, Y] pixels in dimension
    cardBottom   = 1,        // absolute percentage between the bottom of the cards and the bottom of the page
    rotateYAngle = 1,         // rotational Y angle of skew
    cardOffset   = 0.25,        // offset between skewed cards and the front facing card
    curve        = 'easeInOut',    // transition curve type
    easeDuration = 150,         // amount of time for cards to transition
    zPosFaceCard = 200,         // z position offset for the face card
    yPosFaceCard = -20,         // y position offset for the face card
    // cardSpacing  = Math.floor(-cardSize[0] * 0.5);
    cardSpacing = 0;

  //////////////////////////
  //// HELPER FUNCTIONS ////
  //////////////////////////

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
        rendernode.object.setProperties({
          boxShadow: '3px 3px 3px black'
        });
        break;
      case "right":
        theta = -rotateYAngle;
        break;
    }
    rendernode.angle = direction;
    var mod = rendernode.modifiers[0];
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
      size: [window.innerWidth, cardSize[1]],
      classes: ['blocker']
    });

    var blockingMod = new Modifier({
      transform: Matrix.translate(0, window.innerHeight - cardSize[1], 40)
    });

    mapSection.add(blockingMod).link(blockingSurface);

    var centerIndex = Math.floor((window.innerWidth / Math.abs(cardSpacing)) / 2)

    var
      cardSurfaces = [],
      currentFace,
      renderNode;

    eventHandler.on('focusCard', function(id){
      for(var i = 0; i < cardSurfaces.length; i++){
        if(cardSurfaces[i].id === id){
          scrollview.moveToIndex(i);
          break;
        }
      }
    });

    window.scrollview = new Scrollview({
      itemSpacing: cardSpacing,
      clipSize: window.innerWidth/5,
      // margin: 80,
      speedLimit: 1.3,
      drag: 0.004,
      edgePeriod: 150
    }, function(pos){
      if(scrollview.getCurrentNode()){
        setFace();
      }
    });

    blockingSurface.pipe(scrollview);

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
        transform: Matrix.move(Matrix.rotateY(-2), [0,-500,0])
      });

      if(!cardSurfaces.length || first){
        renderNode.angle = "center";
        modifier = new Modifier({
          transform: Matrix.translate([0, yPosFaceCard, zPosFaceCard])
        });
        scrollview.sequenceFrom(cardSurfaces);
        setFace(0);
        first = false;
      }

      cardSurface.pipe(renderNode);
      renderNode.link(modifier).link(cardSurface);
      cardSurfaces.push(renderNode);
      renderNode.pipe(scrollview);
      modifier.setTransform(Matrix.move(Matrix.rotateY(-rotateYAngle), [0, 0, 60]), {duration: 300, curve: 'easeIn'})
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
              setFace();
              scrollview.sequenceFrom(cardSurfaces);
            }, 0)
          }
          var card = cardSurfaces[i];
          // return cardSurfaces[i].modifiers[0].setTransform(Matrix.move(Matrix.rotateY(-2), [0,400, 0], {duration: 200, curve: 'easeIn'}), function(){
          //   cardSufraces.splice(cardSurfaces.indexOf(card), 1);
          // });
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