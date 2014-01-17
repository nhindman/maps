var config  = require('./config.js');
var express = require('express');
var url     = require('url');
var yelp    = require('./yelp').createClient({
  consumer_key: config.yelp.consumerKey, 
  consumer_secret: config.yelp.consumerSecret,
  token: config.yelp.token,
  token_secret: config.yelp.tokenSecret
});

var app = express.createServer();

// Yelp API endpoints
// FIXME: Not stuck on using 'yelp' in endpoint name
app.get('/yelp/geo', function(req, res) {

  // Get the url query parameters
  var query = url.parse(req.url, true).query;

  // Provide default values
  var params = {
    lat: query.lat || 37.788022,
    long: query.long || -122.399797,
    filter: query.filter || 'arts',
    radius: query.radius || 3218
  }

  yelp.geo(params, function(error, data) {
    if(error) {
      console.log('Error:', error);
    } else {
      
      // Loop through all listed businesses
      // for(var i = 0; i < data.businesses.length; i++) {
      //   console.log(data.businesses[i].name);
      //   console.log(data.businesses[i].location);
      // }

      res.send(data.businesses);
    }
  });
  
});

// Serve every static file in public dir
app.use(express.static(__dirname + "/public"));

app.listen(config.port);
console.log('Listening on port ' + config.port);


