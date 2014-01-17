define(function(require, exports, module){

  // require modules
  var
    Surface  = require('famous/Surface'),
    Modifier = require('famous/Modifier'),
    Matrix   = require('famous/Matrix');

  // helper function to handle rotation and position
  var rotatePos = function(theta, x, y){
    return new Modifier({
      transform: Matrix.rotateY(theta),
      origin: [x, y]
    });
  };

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
    }
  ]

  module.exports = function(mapSection, Engine){

    // options
    var
      cardSize     = [80, 120],   // [X, Y] pixels in dimension (cards also have a 10px border at the moment)
      cardBottom   = 0.95,        // absolute percentage between the bottom of the cards and the bottom of the page
      rotateYAngle = 1.3,         // rotational Y angle of skew
      cardOffset   = 0.07;         // offset between skewed cards and the front facing card

    // listen for touch events on the engine itself
    Engine.on('touchmove', function(event){
      var height = window.innerHeight * 0.95 - 120;
      if(event.touches[0].pageY > height){
        // find card at event.touches[0].pageX
        // if that card is not flipped out, call the function that flips that card out and flips all other cards over
      }
    });

    // helper function to create cards and display them at proper skew
    // "face" is the card that is not skewed
    var createCards = function(faceIndex){

      // this is the position of the card that is facing out
      var facePos = (1 / data.length) * (faceIndex);
      // this is the incremenet amount for X position for every card not including offset
      var increment = window.innerWidth/(data.length - 1);
      // this is the width of space to fill all cards left of face
      var leftWidth = facePos - cardOffset;
      // this is the width of the space to fill all cards right of face
      var rightWidth = 1 - facePos + cardOffset;

      var i, cardSurface, leftwidth, leftAmount, modifier;

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
          })
        }

        var pos = increment*i;

        console.log(pos/window.innerWidth);



        if(i < faceIndex){
          leftAmount = (increment * i * (1 - cardOffset)) / window.innerWidth;
          modifier = rotatePos(rotateYAngle, leftAmount, cardBottom);
        }

        if(i === faceIndex){
          leftAmount = (increment * i) / window.innerWidth;
          modifier = rotatePos(0, leftAmount, cardBottom);
        }

        // if(i > faceIndex){
        //   leftAmount = (increment * i * (1 - cardOffset)) / window.innerWidth;
        //   modifier = rotatePos(-rotateYAngle, leftAmount, cardBottom);
        // }
        // console.log(leftAmount);
        mapSection.add(modifier).link(cardSurface);
        // mapSection.add(rotatePos(0.2, pos/window.innerWidth, cardBottom)).link(cardSurface);

      }
    };

    createCards(3);

    // create the golden gate bridge at the center
    // var goldenGateSurface = new Surface({
    //   size: cardSize,
    //   properties: {
    //     backgroundImage: 'url(http://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Golden_Gate_Bridge_20100906_04.JPG/80px-Golden_Gate_Bridge_20100906_04.JPG)'
    //   },
    //   classes: ['card']
    // });
    // mapSection.add(new Modifier({origin: [0.5, cardBottom]})).link(goldenGateSurface);


    // create objects to the left of center
    // var cardSurface;
    // for(var i = 1; i < 11; i++){
    //   cardSurface = new Surface({
    //     size: cardSize,
    //     properties: {
    //       backgroundColor: 'steelblue'
    //     },
    //     classes: ['card']
    //   });
    //   mapSection.add(rotatePos(-rotateYAngle, 0.53 + (0.5/10)*i, cardBottom)).link(cardSurface);
    // }

    // // create objects to the right of center
    // for(var i = 1; i < 11; i++){
    //   cardSurface = new Surface({
    //     size: cardSize,
    //     properties: {
    //       backgroundColor: 'steelblue'
    //     },
    //     classes: ['card']
    //   });
    //   mapSection.add(rotatePos(rotateYAngle, 0.47 - (0.5/10)*i, cardBottom)).link(cardSurface);
    // }

  }
});