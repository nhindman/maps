define(function(require, exports, module){

  /////////////////
  //// OPTIONS ////
  /////////////////
  var
    cardSize     = [80, 120],   // [X, Y] pixels in dimension (cards also have a 10px border at the moment)
    cardBottom   = 0.95,        // absolute percentage between the bottom of the cards and the bottom of the page
    rotateYAngle = 1.3,         // rotational Y angle of skew
    cardOffset   = 0.15,        // offset between skewed cards and the front facing card
    curve        = 'linear',
    easeDuration = 250,
    zPosFaceCard = 120,
    yPosFaceCard = -15;

  // require modules
  var
    Surface      = require('famous/Surface'),
    Modifier     = require('famous/Modifier'),
    Matrix       = require('famous/Matrix'),
    ViewSequence = require('famous/ViewSequence');

  var currentFace = null;

  // helper function to handle rotation and position
  var rotatePos = function(theta, x, y, yPos, zPos){
    yPos = yPos || 0;
    zPos = zPos || 50;
    return new Modifier({
      transform: Matrix.move(Matrix.rotateY(theta), [0, yPos, zPos]),
      origin: [x, y]
    });
  };

  var transformCard = function(surface, Xoffset, direction){
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
    surface.angle = direction;
    surface.modifier.setTransform(Matrix.move(Matrix.rotateY(theta), [0,y,z]), {
      duration: easeDuration,
      curve: curve
    });
    surface.modifier.setOrigin([Xoffset, cardBottom], {
      duration: easeDuration,
      curve: curve
    });
  }
  // helper function to rotate positions from surfaces plus offsets

  var data = [
    {
      name: 'Splash'
    },
    {
      name: 'Splash'
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
      name: 'Splash'
    },
    {
      name: 'Splash'
    },
    {
      name: 'Bay Bridge',
      image: 'url(http://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Rama_VIII_Bridge_spanning_the_Chao_Phraya_River_in_Bangkok.jpg/80px-Rama_VIII_Bridge_spanning_the_Chao_Phraya_River_in_Bangkok.jpg)'
    },
    {
      name: 'Splash'
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

  module.exports = function(mapSection, Engine){

    // storage for our various surfaces and modifiers
    var
      cardSurfaces = [],
      // modifiers = [],
      currentFace;

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
          Xoffset = (increment * i * (1 - cardOffset));
          modifier = rotatePos(rotateYAngle, Xoffset, cardBottom);
          cardSurface.angle = 'left';
        }

        if(i === faceIndex){
          Xoffset = (increment * i);
          modifier = rotatePos(0, Xoffset, cardBottom, yPosFaceCard, zPosFaceCard);
          cardSurface.angle = 'center';
        }

        if(i > faceIndex){
          Xoffset = (increment * i) * (1 - cardOffset) + cardOffset;
          modifier = rotatePos(-rotateYAngle, Xoffset, cardBottom);
          cardSurface.angle = 'right';
        }

        cardSurface.modifier = modifier;
        mapSection.add(modifier).link(cardSurface);
        cardSurfaces.push(cardSurface);
      }
    };
    createCards(5);

    //////////////////////////////
    //// ARRAY IMPLEMENTATION ////
    //////////////////////////////

    var setFace = function(faceIndex){

      var
        increment = 1 / (data.length - 1),
        Xoffset;

      cardSurfaces.forEach(function(cardSurface, index){
        if(index < faceIndex && cardSurface.angle !== "left"){
          Xoffset = (increment * index * (1 - cardOffset));
          transformCard(cardSurface, Xoffset, "left");
          // cardSurface.modifier.setTransform(Matrix.move(Matrix.rotateY(rotateYAngle), [0,0,50]), {
          //   duration: easeDuration,
          //   curve: curve
          // });
          // cardSurface.modifier.setOrigin([Xoffset, cardBottom], {
          //   duration: easeDuration,
          //   curve: curve
          // });
        }

        if(index === faceIndex && cardSurface.angle !== "center"){
          Xoffset = (increment * index);
          transformCard(cardSurface, Xoffset, "center");
          // modifier.setTransform(Matrix.move(Matrix.rotateY(0), [0,0,80]), {
          //   duration: easeDuration,
          //   curve: curve
          // });
          // modifier.setOrigin([Xoffset, cardBottom], {
          //   duration: easeDuration,
          //   curve: curve
          // };
        }

        if(index > faceIndex && cardSurface.angle !== "right"){
          Xoffset = (increment * index) * (1 - cardOffset) + cardOffset;
          transformCard(cardSurface, Xoffset, "right")
          // modifier.setTransform(Matrix.move(Matrix.rotateY(-rotateYAngle), [0,0,50]), {
          //   duration: easeDuration,
          //   curve: curve
          // });
          // modifier.setOrigin([Xoffset, cardBottom], {
          //   duration: easeDuration,
          //   curve: curve
          // });
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

    Engine.on('touchmove', function(event){
      var height = window.innerHeight * 0.95 - 120;
      if(event.touches[0].pageY > height){
        var increment = window.innerWidth / (data.length);
        var cardIndex = Math.floor(event.touches[0].pageX/increment);
        if(cardIndex !== currentFace){
          setFace(cardIndex);
          console.log('set face on ' + cardIndex);
        }
      }
    });
  };
});