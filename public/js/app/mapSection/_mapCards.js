define(function(require, exports, module){
  var
    Surface        = require('./customSurface'),
    Modifier       = require('famous/Modifier'),
    Matrix         = require('famous/Matrix'),
    ViewSequence   = require('famous/ViewSequence'),
    Scrollview     = require('./customScrollView'),
    PhysicsEngine  = require('famous-physics/PhysicsEngine'),
    Spring         = require('famous-physics/forces/Spring'),
    Time           = require('famous-utils/Time'),
    RenderNode     = require('./customRenderNode');

  /////////////////
  //// OPTIONS ////
  /////////////////
  var
    cardWidth    = Math.min(window.innerWidth/3, window.innerHeight/5),
    cardSize     = [cardWidth, cardWidth],   // [X, Y] pixels in dimension
    cardBottom   = 0,                              // absolute percentage between the bottom of the cards and the bottom of the page
    rotateYAngle = 0,                              // rotational Y angle of skew
    cardOffset   = 0,                           // offset between skewed cards and the front facing card (DEPRECATED)
    curve        = 'easeInOut',                    // transition curve type
    easeDuration = 150,                            // amount of time for cards to transition
    zPosFaceCard = cardWidth * 1.5,                            // z position offset for the face card
    yPosFaceCard = -cardWidth * 0.3,                            // y position offset for the face card

    // For smaller screen, apply less card spacing
    cardSpacing  = (window.innerWidth < 768) ? Math.floor(cardSize[0] * 0.25) : Math.floor(cardSize[0] * 0.65); 

  //////////////////////////
  //// HELPER FUNCTIONS ////
  //////////////////////////

  var transformCard = function(rendernode, direction){
    var
      theta,
      y = 0,
      z = 60;

    switch(direction){
      case 'left':
        theta = rotateYAngle;
        break;
      case 'center':
        theta = 0;
        y = yPosFaceCard;
        z = zPosFaceCard;
        rendernode.object.setProperties({
          // boxShadow: '3px 3px 3px black'
        });
        break;
      case 'right':
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
  };

  module.exports = function(mapNode, Engine, eventHandler, allMarkers, currentLoc){

    /////////////
    // BLOCKER //
    /////////////

    var blockingSurface = new Surface({
      size: [window.innerWidth, cardSize[1] + 40],
      classes: ['blocker']
    });

    var blockingMod = new Modifier({
      origin: [0,1],
      transform: Matrix.translate(0,0,40)
    });

    mapNode.add(blockingMod).link(blockingSurface);


    ////////////////
    // SCROLLVIEW //
    ////////////////

    var
      cardSurfaces = [],
      first        = true,
      currentFace,
      renderNode;

    window.scrollview = new Scrollview({
      itemSpacing: cardSpacing,
      clipSize: cardSize[0]*0 + 0.0001,
      margin: window.innerWidth,
      paginated: true,
      speedLimit: 10
      // drag: 0.004,
      // edgePeriod: 150
    // })
    }, function(pos){
      if(scrollview.node){
        setFace();
      }
    });

    blockingSurface.pipe(scrollview);

    var modalExists = false;


    var setFace = function(faceIndex){
      faceIndex = faceIndex || scrollview.node.index;

      if(currentFace === faceIndex){ return; }

      if(cardSurfaces[faceIndex]){
        eventHandler.emit('focus', cardSurfaces[faceIndex].id);
        transformCard(cardSurfaces[faceIndex], 'center');
        cardSurfaces[faceIndex].object.setOptions({ classes : ['cardFocus'] });
        cardSurfaces[faceIndex].object.setProperties({
          'background-image': '-webkit-gradient(linear, 0 top, 0 bottom, from(rgba(11,27,46,0.4)), to(rgba(11,27,46,0))),' +
            ' url(' + cardSurfaces[faceIndex].object.bgImage + ')'
        });
      }

      if(cardSurfaces[currentFace]){
        transformCard(cardSurfaces[currentFace], 'left');
        cardSurfaces[currentFace].object.setOptions({ classes : ['card'] });
        cardSurfaces[currentFace].object.setProperties({
          'background-image': '-webkit-gradient(linear, 0 top, 0 bottom, from(rgba(11,27,46,0.5)),' +
            ' to(rgba(11,27,46,0.5))), url(' + cardSurfaces[currentFace].object.bgImage + ')'
        });
      }
      
      currentFace = faceIndex;
    };


    ///////////////////////
    // CARD MANIPULATION //
    ///////////////////////

    var resetCard;

    var addCard = function(location){

      var cardSurface = new Surface({
        size: cardSize,
        content: location.name,
        classes: ['card'],
        properties: {
          'background-image': '-webkit-gradient(linear, 0 top, 0 bottom, from(rgba(11,27,46,0.5)), to(rgba(11,27,46,0.5))),' +
            ' url(' + location.photo + ')'
        }
      });
      cardSurface.bgImage = location.photo;

      var renderNode = new RenderNode({id: location.id});
      renderNode.angle = 'left';
      var modifier = new Modifier({
        transform: Matrix.move(Matrix.rotateY(-2), [200,-100,100])
      });

      if(!cardSurfaces.length || first){
        scrollview.sequenceFrom(cardSurfaces);
        setFace();
        first = false;

        // For first render - first card in scrollview
        renderNode.angle = 'center';
        cardSurface.setOptions({ classes : ['cardFocus'] });
        cardSurface.setProperties({
          'background-image': '-webkit-gradient(linear, 0 top, 0 bottom, from(rgba(11,27,46,0.4)),' +
            ' to(rgba(11,27,46,0))), url(' + cardSurface.bgImage + ')'
        });
      }

      cardSurface.pipe(renderNode);
      renderNode.link(modifier).link(cardSurface);
      renderNode.pipe(scrollview);

      var endMatrix = (cardSurfaces.length) ? 
        Matrix.move(Matrix.rotateY(-rotateYAngle), [0, 0, 60]) : 
        Matrix.translate(0, yPosFaceCard, zPosFaceCard);

      cardSurfaces.push(renderNode);
      modifier.setTransform(endMatrix, {duration: 300, curve: 'easeIn'});


      /**********************************************************/
      /**************** Card Pop / Swipe Out*********************/
      /**********************************************************/

      // Create vars to be captured in closure
      var index, node, nodeSurface, newNode, part, PhyEng, spring, draggable, map, emitInfo, setWalkDirListener;

      var startX, startY;
      cardSurface.on('touchstart', function(event) {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      });

      cardSurface.on('touchend', function(touchEvent){
        // Find the scrollview item that matches our clicked surface
        for(var i = 0; i < scrollview.node.array.length; i++) {
          if(touchEvent.origin.id === scrollview.node.array[i].object.id) {
            index = i;
          }
        }

        // Only pop-up if center item and card swiped up.
        if(scrollview.node.array[index].angle === "center" && (touchEvent.changedTouches[0].clientY - startY) < -40) {
          // FIXME: look into using a get() here.
          node = scrollview.node.array[index];

          // Modify the node to larger size
          nodeSurface = node.object;
          nodeSurface.setOptions({ properties : { 'visibility' : 'hidden' }});

          // New surface for larger card.
          var bigSize = (window.innerWidth * 0.8 > 400) ? [350, 450] : [window.innerWidth * 0.8, window.innerHeight * 0.8];
          newNode = new Surface({
            size: bigSize,
            classes: ['bigCard'],
            content:  '<div class="photo" style="height: ' + bigSize[1] * 0.33 + 'px; background-image: url(' + ((allMarkers[node.id].data.photoPrefix) ? allMarkers[node.id].data.photoPrefix + (window.innerWidth - 80) + 'x' + (window.innerWidth - 80) : '' ) + allMarkers[node.id].data.photoSuffix + ')"></div>' +
              '<div class="icon walking-dir"><i class="icon-pitch"></i></div>' +
              '<div class="info" style="height: ' + bigSize[1] * 0.63 + 'px;">' +
                ((allMarkers[node.id].data.rating) ? '<div class="rating">' + allMarkers[node.id].data.rating + '/10</div>' : '<div class="rating" style="visibility: hidden;"></div>' ) +
                '<h1>' + allMarkers[node.id].data.name + '</h1>' +
                '<h5>' + ((allMarkers[node.id].data.address) ? allMarkers[node.id].data.address + ', ' : '') + allMarkers[node.id].data.city + ', ' + allMarkers[node.id].data.state + '</h5>' +
                '<p>' + ((allMarkers[node.id].data.tip) ? '&ldquo;' + allMarkers[node.id].data.tip + '&rdquo;</p>' : '</p>') +
                '<p>' + ((allMarkers[node.id].data.tipUser) ? '- ' + allMarkers[node.id].data.tipUser + '</p>' : '</p>') +
                ((findDistance(currentLoc, { lat: allMarkers[node.id].data.lat, lng: allMarkers[node.id].data.long })) !== "NaN" ? '<p class="distance"><span class="distanceAwayNum">' + findDistance(currentLoc, { lat: allMarkers[node.id].data.lat, lng: allMarkers[node.id].data.long }) + '</p>' : '') +
              '</div>'
          });

          //When walking icon is clicked, event and rendernode is emitted          
          setWalkDirListener = function(){
            // $('.icon').on({'tap': emitInfo, 'click': emitInfo});
            $('.bigCard').on('tap', function(event){
              if (event.target.className === "icon-pitch" || event.target.className === "icon walking-dir"){
                emitInfo();
                $('.bigCard').off('tap');
              } else {
                resetCard();
                $('.bigCard').off('tap');
              }
            });
          };

          newNode.on('deploy', setWalkDirListener);
          emitInfo = function(){
            // hide cards

            $('.walking-dir').html('<i class="icon-spin4 animate-spin"></i>')
            eventHandler.emit('walking-dir', scrollview.node.array[index]);
          };

          PhyEng = new PhysicsEngine();
          part = PhyEng.createBody({
            shape : PhyEng.BODIES.RECTANGLE,
            size : bigSize
          });
          part.link(newNode);

          spring = new Spring({
            anchor : [ 0, -(window.innerHeight / 2), 0],
            period : 300,
            dampingRatio : 0.5
          });
          PhyEng.attach(spring, part);
          
          modalExists ? mapNode.object.pop() : modalExists = true;
          mapNode.add(newNode).add(new Modifier({ origin : [0.5, 0.98], transform : node.modifiers[0].getTransform() } )).link(PhyEng);

          // Blur the map after transform has completed.
          // Otherwise there's performance issues on mobile.
          // Don't fuck with the DOM!
          map = document.getElementById("map-canvas");
          // Time.setTimeout(function(){
          //   map.className = "blur";
          // }, 400);

          // newNode.on('touchend', function(event) {

          resetCard = function(){

            var mod = node.modifiers[0].getTransform();
            node.modifiers[0].setTransform( Matrix.translate(0, window.innerHeight, 100), {
              duration: 300,
              curve: curve
            },function(){
              nodeSurface.setOptions({ properties : { 'visibility' : 'visible' }});
              node.modifiers[0].setTransform(mod, {});
            });

            // Change the anchor point for it springs off screen
            spring.setOpts({ anchor : [ 0, 200, 0] });
            newNode.size = cardSize;
          }


        }

      });

      /**********************************************************/
      /**********************************************************/

    };

    var findDistance = function(coord1, coord2) {

      var toRad = function(x) {
        return x * Math.PI / 180;
      };

      var a =
        Math.pow(Math.sin(toRad(coord2.lat - coord1.lat)/2), 2) +
        Math.pow(Math.sin(toRad(coord2.lng - coord1.lng)/2), 2) *
        Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat));

      var result = (3963.1676 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));

      if (result < 0.2) {
        return (5280 * result).toFixed(0) + '</span> feet away';
      } else {
        return result.toFixed(1) + '</span> miles away';
      }
    };

    var hideCards = function(){
      scrollviewMod.setTransform(Matrix.translate(0,400,0), {duration: 400});
      resetCard();
    }

    var showCards = function(){
      scrollviewMod.setTransform(Matrix.translate(0,-30,0), {duration: 400, curve: 'easeOutBounce'});
    };

    
    var removeCard = function(id){
      for(var i = 0; i < cardSurfaces.length; i++){
        if(cardSurfaces[i].id === id){
          // if the angle is 'center', that means this card was the face card and we need to set a new face.
          if(cardSurfaces[i].angle === 'center'){
            eventHandler.emit('unfocus', id);
            setTimeout(function(){
              setFace(1);
              setFace(0);
              scrollview.sequenceFrom(cardSurfaces);
            }, 0)
          }
          var card = cardSurfaces[i];
          return cardSurfaces.splice(i, 1);
        }
      }
    };

    var focusCard = function(id){
      for(var i = 0; i < cardSurfaces.length; i++){
        if(cardSurfaces[i].id === id){
          return scrollview.moveToIndex(i);
        }
      }
    };

    /////////////////////
    // EVENT LISTENERS //
    /////////////////////

    eventHandler.on('addCard',    addCard);
    eventHandler.on('removeCard', removeCard);
    eventHandler.on('focusCard',  focusCard);
    eventHandler.on('hideCards',  hideCards);
    eventHandler.on('showCards',  showCards);


    /////////////////////////////////////////////

    var scrollviewMod = new Modifier({
      transform: Matrix.translate(0, window.innerHeight, 200),
      origin: [0.5, 1]
    });

    mapNode.add(scrollviewMod).link(scrollview);
  };
});