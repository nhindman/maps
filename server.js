var config      = require('./config.js'),
    express     = require('express'),
    url         = require('url'),
    foursquare  = require('node-foursquare-venues')(config.fourSquare.clientId, config.fourSquare.clientSecret);

var app = express();

app.get('/points', function(req, res) {

  var query = url.parse(req.url, true).query;

  var options = {
    ll : query.lat + ',' + query.long,
    radius: query.radius || 15000,
    venuePhotos: 1,
    section: query.cat || 'sights', 
    // section: 'topPicks',
    limit: query.limit || 50
  };

  foursquare.venues.explore(options, function(responseCode, data) {

    if(responseCode !== 200) {
      res.send('Error retrieving 4square results', data)
      return;
    }
    
    var results = [];

    if(!data.response.groups && data.response.groups.length < 1) {
      console.log('Error, response data had no venues');
      res.send(results);
      return;
    }

    var venues = data.response.groups[0].items;

    for(var i = 0; i < venues.length; i++) {
      // console.log(venues[i]);
      var venue         = {};
      venue.id          = venues[i].venue.id;
      venue.name        = venues[i].venue.name;
      venue.lat         = venues[i].venue.location.lat;
      venue.long        = venues[i].venue.location.lng;
      venue.address     = venues[i].venue.location.address;
      venue.city        = venues[i].venue.location.city;
      venue.state       = venues[i].venue.location.state;
      // venue.crossStreet = venues[i].venue.location.crossStreet;

      venue.photo       = null;
      if(venues[i].venue.photos.groups[0]) {
        var photo       = venues[i].venue.photos.groups[0].items[0];
        venue.photo     = photo.prefix + photo.width + 'x' + photo.height + photo.suffix;
      }

      results.push(venue);
    }

    res.send(results);

  });

});

// Serve every static file in public dir
app.use(express.static(__dirname + "/public"));

app.listen(config.port);
console.log('Listening on port ' + config.port);


