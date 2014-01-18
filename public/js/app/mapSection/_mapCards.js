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
    rotateYAngle = 1.3,         // rotational Y angle of skew
    cardOffset   = 0.25,        // offset between skewed cards and the front facing card
    curve        = 'easeInOut',    // transition curve type
    easeDuration = 250,         // amount of time for cards to transition
    zPosFaceCard = 120,         // z position offset for the face card
    yPosFaceCard = -25;         // y position offset for the face card

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
    rendernode.object[0].object.angle = direction;
    rendernode.object[0].object.modifier.halt();
    rendernode.object[0].object.modifier.setTransform(Matrix.move(Matrix.rotateY(theta), [0,y,z]), {
      duration: easeDuration,
      curve: curve
    });
    rendernode.object[0].object.modifier.setOrigin([Xoffset, cardBottom], {
      duration: easeDuration,
      curve: curve
    });
  }

  module.exports = function(mapSection, Engine){

    // storage for our various surfaces and modifiers
    var
      cardSurfaces = [],
      currentFace,
      scrollview = new Scrollview({
        itemSpacing: -50,
      }),
      renderNode;

    // helper function to create cards and display them at proper skew
    // "face" is the card that is not skewed
    var createCards = function(faceIndex){

      // this is the incremenet amount for X position for every card not including offset
      var increment = 1 / (data.length - 1);

      var i, cardSurface, Xoffset, modifier;

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

        if(i < faceIndex){
          // Xoffset = (increment * i * (1 - cardOffset));
          Xoffset = 0;
          modifier = rotatePos(rotateYAngle, Xoffset, cardBottom);
          cardSurface.angle = 'left';
        }

        if(i === faceIndex){
          // Xoffset = (increment * i);
          Xoffset = 0;
          modifier = rotatePos(0, Xoffset, cardBottom, yPosFaceCard, zPosFaceCard);
          cardSurface.angle = 'center';
        }

        if(i > faceIndex){
          Xoffset = 0;
          // Xoffset = (increment * i) * (1 - cardOffset) + cardOffset;
          modifier = rotatePos(-rotateYAngle, Xoffset, cardBottom);
          cardSurface.angle = 'right';
        }
        cardSurface.modifier = modifier;
        rendernode = new RenderNode({index: i});
        cardSurface.pipe(rendernode);
        rendernode.on('touchmove', function(event, node){
          // console.log(node);
          setFace(node.index);
        });
        rendernode.add(modifier).link(cardSurface);
        // mapSection.add(modifier).link(cardSurface);
        cardSurfaces.push(rendernode);
      }
    };
    createCards(cardSurfaces.length/2);
    scrollview.sequenceFrom(cardSurfaces);
    Engine.pipe(scrollview);
    mapSection.add(new Modifier({origin: [0, .95]})).link(scrollview);

    //////////////////////////////
    //// ARRAY IMPLEMENTATION ////
    //////////////////////////////

    var setFace = function(faceIndex){
      var
        increment = 1 / (data.length - 1),
        Xoffset;

      cardSurfaces.forEach(function(cardSurface, index){
        if(index < faceIndex && rendernode.object[0].object.angle !== "left"){
          Xoffset = 0;
          // Xoffset = (increment * index * (1 - cardOffset));
          transformCard(cardSurface, Xoffset, "left");
        }

        if(index === faceIndex && rendernode.object[0].object.angle !== "center"){
          Xoffset = 0;
          // Xoffset = (increment * index);
          transformCard(cardSurface, Xoffset, "center");
        }

        if(index > faceIndex && rendernode.object[0].object.angle !== "right"){
          Xoffset = 0;
          // Xoffset = (increment * index) * (1 - cardOffset) + cardOffset;
          transformCard(cardSurface, Xoffset, "right")
        }
      })
      currentFace = faceIndex;
    };


    ////////////////////////////////////
    //// LINKED LIST IMPLEMENTATION ////
    ////////////////////////////////////

    // var increment = 1 / (data.length - 1);


    // var setFace = function(index){

    //   // set center
    //   var viewSequence = new ViewSequence(cardSurfaces, index, false);
    //   var Xoffset = increment * viewSequence.index;
    //   transformCard(viewSequence.get(), Xoffset, 'center');

    //   // recursively set left angles
    //   function setLeftFace(view){
    //     if(view.get().angle === 'left' || !view.getPrevious()){
    //       return;
    //     }
    //     Xoffset = (increment * view.index * (1 - cardOffset));
    //     transformCard(view.get(), Xoffset, 'left');
    //     setLeftFace(view.getPrevious());
    //   }
    //   setLeftFace(viewSequence.getPrevious());

    //   // recursively set right angles
    //   function setRightFace(view){
    //     if(view.get().angle === 'right' || !view.getNext()){
    //       return;
    //     }
    //     Xoffset = (increment * view.index) * (1 - cardOffset) + cardOffset;
    //     transformCard(view.get(), Xoffset, 'right');
    //     setRightFace(view.getNext());
    //   }
    //   setRightFace(viewSequence.getNext());

    // };
    // scrollview.on('touchstart', function(){
    //   console.log('click')
    // })
    // cardSurfaces[0].on('touchmove', function(event){
    //   console.log(cardSurfaces[0]);
    // });

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
  };
});