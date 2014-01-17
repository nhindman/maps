var config  = require('./config.js'),
    express = require('express'),
    url     = require('url'),
    yelp    = require('./yelp').createClient({
      consumer_key: config.yelp.consumerKey, 
      consumer_secret: config.yelp.consumerSecret,
      token: config.yelp.token,
      token_secret: config.yelp.tokenSecret
    });

var app = express.createServer();

// Yelp API endpoints
app.get('/yelp/geo', function(req, res) {

  // Get the url query parameters
  var query = url.parse(req.url, true).query;

  yelp.geo({ lat: query.lat, long: query.long || -122.399797 }, function(error, data) {
    if(error) {
      console.log('Error:', error);
    } else {
      res.send(data.businesses);
    }
  });
  
});

// Serve every static file in public dir
app.use(express.static(__dirname + "/public"));

app.listen(config.port);
console.log('Listening on port ' + config.port);


