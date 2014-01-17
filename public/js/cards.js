
define(function(require, module, exports){
  var
    Surface     = require('famous/Surface'),
    Engine      = require('famous/Engine'),
    CardsLayout = require('famous-views/CardsLayout');

  module.exports = function(mapSection){
    var cardsLayout = new CardsLayout();
    mapSection.add(cardsLayout);

    var cardSurface = new Surface({
      size: [200, undefined],
      content: 'Hi',
      properties: {
        'background-color': 'steelblue'
      }
    });

    cardsLayout.show(cardSurface);
  }
});

// define(function(require, exports, module) {
//     var Engine = require('famous/Engine');
//     var CardsLayout  = require('famous-views/CardsLayout');
//     var Surface = require('famous/Surface');

//     var Context = Engine.createContext();
//     var cardslayout = new CardsLayout();

//     Context.link(cardslayout);

//     var cards = 0;

//     Engine.on('click', function() {

//         color = [
//             'hsv(',
//             String(cards << 5),
//             '100, 100)'
//         ].join('');

//         cardslayout.show(
//             new Surface({
//                 size: [200, undefined],
//                 content: cards,
//                 properties:{
//                     backgroundColor: color
//                 }
//             })
//         );

//         cards++;
//     });

// });