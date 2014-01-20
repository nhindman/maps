// dummy data
var data = [
  {
    name: 'Splash'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Golden Gate Bridge',
    image: 'url(http://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Golden_Gate_Bridge_20100906_04.JPG/80px-Golden_Gate_Bridge_20100906_04.JPG)'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Bay Bridge',
    image: 'url(http://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Rama_VIII_Bridge_spanning_the_Chao_Phraya_River_in_Bangkok.jpg/80px-Rama_VIII_Bridge_spanning_the_Chao_Phraya_River_in_Bangkok.jpg)'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Steph Curry'
  },
  {
    name: 'Klay Thompson'
  },
    {
    name: 'Splash'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Golden Gate Bridge',
    image: 'url(http://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Golden_Gate_Bridge_20100906_04.JPG/80px-Golden_Gate_Bridge_20100906_04.JPG)'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Bay Bridge',
    image: 'url(http://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Rama_VIII_Bridge_spanning_the_Chao_Phraya_River_in_Bangkok.jpg/80px-Rama_VIII_Bridge_spanning_the_Chao_Phraya_River_in_Bangkok.jpg)'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Steph Curry'
  },
  {
    name: 'Klay Thompson'
  },
    {
    name: 'Splash'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Golden Gate Bridge',
    image: 'url(http://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Golden_Gate_Bridge_20100906_04.JPG/80px-Golden_Gate_Bridge_20100906_04.JPG)'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Bay Bridge',
    image: 'url(http://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Rama_VIII_Bridge_spanning_the_Chao_Phraya_River_in_Bangkok.jpg/80px-Rama_VIII_Bridge_spanning_the_Chao_Phraya_River_in_Bangkok.jpg)'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Steph Curry'
  },
  {
    name: 'Klay Thompson'
  },
    {
    name: 'Splash'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Golden Gate Bridge',
    image: 'url(http://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Golden_Gate_Bridge_20100906_04.JPG/80px-Golden_Gate_Bridge_20100906_04.JPG)'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Bay Bridge',
    image: 'url(http://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Rama_VIII_Bridge_spanning_the_Chao_Phraya_River_in_Bangkok.jpg/80px-Rama_VIII_Bridge_spanning_the_Chao_Phraya_River_in_Bangkok.jpg)'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Splash'
  },
  {
    name: 'Bros'
  },
  {
    name: 'Steph Curry'
  },
  {
    name: 'Klay Thompson'
  }
];

define(function(require, exports, module){
  var
    Surface      = require('./customSurface'),
    Modifier     = require('famous/Modifier'),
    Matrix       = require('famous/Matrix'),
    ViewSequence = require('famous/ViewSequence'),
    Scrollview = require('./customScrollView'),
    RenderNode = require('./customRenderNode')

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
    zPosFaceCard = 120,         // z position offset for the face card
    yPosFaceCard = -25,         // y position offset for the face card
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
    // rendernode.object[0].object.modifier.halt();
    var mod = rendernode.object[0].modifiers[0];
    if (mod) {
      mod.halt();
      mod.setTransform(Matrix.move(Matrix.rotateY(theta), [0,y,z]), {
        duration: easeDuration,
        curve: curve
      });
      mod.setOrigin([Xoffset, cardBottom], {
        duration: easeDuration,
        curve: curve
      });
    }
  }

  module.exports = function(mapSection, Engine){

    // storage for our various surfaces and modifiers
    var centerIndex = Math.floor((window.innerWidth / Math.abs(cardSpacing)) / 2)

    var
      cardSurfaces = [],
      currentFace,
      scrollview = new Scrollview({
        itemSpacing: cardSpacing
        // clipSize: window.innerWidth/2*1.2,
        // edgePeriod: 150
      }, function(pos){
        setFace(scrollview.getCurrentNode().get().index + centerIndex);
      }),
      renderNode;


    // helper function to create cards and display them at proper skew
    // "face" is the card that is not skewed
    var createCards = function(faceIndex){

      // this is the incremenet amount for X position for every card not including offset
      var increment = 1 / (data.length - 1);

      var i, cardSurface, Xoffset, modifier;

      Xoffset = window.innerWidth/2;

      for(i = 0; i < data.length; i++){

        if (data[i].image) {
          cardSurface = new Surface({
            size: cardSize,
            content: data[i].name,
            properties: {
              backgroundImage: data[i].image
            },
            classes: ['card']
          });
        } else {
          cardSurface = new Surface({
            size: cardSize,
            content: data[i].name,
            properties: {
              backgroundColor: 'steelblue'
            },
            classes: ['card']
          });
        }

        rendernode = new RenderNode({index: i});
        if(i < faceIndex){
          // Xoffset = (increment * i * (1 - cardOffset));
          Xoffset = 0;
          modifier = rotatePos(rotateYAngle, Xoffset, cardBottom);
          // cardSurface.angle = 'left';
          rendernode.angle = 'left';
        }

        if(i === faceIndex){
          // Xoffset = (increment * i);
          Xoffset = 0;
          modifier = rotatePos(0, Xoffset, cardBottom, yPosFaceCard, zPosFaceCard);
          rendernode.angle = 'center';
          // cardSurface.angle = 'center';
        }

        if(i > faceIndex){
          Xoffset = 0;
          // Xoffset = (increment * i) * (1 - cardOffset) + cardOffset;
          modifier = rotatePos(-rotateYAngle, Xoffset, cardBottom);
          rendernode.angle = 'right';
          // cardSurface.angle = 'right';
        }
        cardSurface.modifier = modifier;
        cardSurface.pipe(rendernode);
        // rendernode.on('touchmove', function(event, node){
        //   setFace(scrollview.getCurrentNode().get().index + 4);
        // });
        // rendernode.on('touchstart', function(event, node){
        //   setFace(scrollview.getCurrentNode().get().index + 4);
        //   console.log(node);
        //   // setFace(node.index);
        // });
        // rendernode.on('touchend', function(event, node){
        //   setFace(scrollview.getCurrentNode().get().index + 4);
        //   console.log(node);
        //   // setFace(node.index);
        // });
        // rendernode.on('move', function(event, node){
        //   setFace(scrollview.getCurrentNode().get().index + 4);
        //   console.log(node);
        //   // setFace(node.index);
        // });
        rendernode.add(modifier).link(cardSurface);
        // mapSection.add(modifier).link(cardSurface);
        cardSurfaces.push(rendernode);
      }
    };
    createCards(centerIndex);
    scrollview.sequenceFrom(cardSurfaces);
    Engine.pipe(scrollview);
    mapSection.add(scrollview);

    //////////////////////////////
    //// ARRAY IMPLEMENTATION ////
    //////////////////////////////

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


    // Engine.on('touchmove', function(event){
    //   var height = window.innerHeight * 0.95 - 120;
    //   setFace(scrollview.getCurrentNode().index);
    //   if(event.touches[0].pageY > height){
    //     var increment = window.innerWidth / (data.length);
    //     var cardIndex = Math.floor(event.touches[0].pageX/increment);
    //     if(cardIndex !== currentFace){
    //       // setFace(cardIndex);
    //     }
    //   }
    // });
  // setFace(centerIndex)
  };
});