define(function(require, exports, module) {
  var
    FamousEngine = require('famous/Engine'),
    App          = require('app/App'),
    Scrollview = require('app/mapSection/customScrollView'),
    Surface = require('famous/Surface'),
    RenderNode = require('app/mapSection/customRenderNode'),
    Modifier = require('famous/Modifier'),
    Matrix = require('famous/Matrix')

  // create the App from the template
  var app = new App();

  // create a display context and hook in the App
  var mainDisplay = FamousEngine.createContext();
  // mainDisplay.setPerspective(2000);
  // mainDisplay.link(app);
  // FamousEngine.pipe(app);

  // create the various sections
  // require('app/mapSection/mapSection')(app, FamousEngine);
  // var splash = require('app/splashSection/splash');
  // mainDisplay.link(splashSurface);

  // start on the main section
  // app.select('splash');

  //Create a scrollview
  var displays = [];
  var
    splashSurface,
    spashNode,
    height = window.innerHeight,
    width = window.innerWidth,
    mod;
  for (var i = 0; i < 10; i++){
    splashSurface = new Surface({
      content: '<img src="js/app/splashSection/san-francisco-morning-fog.jpg" />',
      size: [height, width]
    });
    splashNode = new RenderNode();
    splashNode.link(splashSurface);
    mod = new Modifier();
    displays.push(splashNode);
  }
  var scrollview = new Scrollview({}, function(pos){
    console.log(pos)
  });
  scrollview.setOptions({
    paginated: true,
    itemSpacing: window.innerWidth + 88,
    direction: 'x'
  });
  FamousEngine.pipe(scrollview);
  // FamousEngine.on('touchmove', function(one, two){
  //   console.log(one, two);
  // })
  scrollview.sequenceFrom(displays);
  scrollview.on('moving', function(one, two){
    console.log(one, two)
  })
  mainDisplay.link(scrollview);

});