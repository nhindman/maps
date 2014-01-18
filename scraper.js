var config  = require('./config.js'),
    express = require('express'),
    url     = require('url'),
    yelp    = require('./yelp').createClient({
      consumer_key: config.yelp.consumerKey, 
      consumer_secret: config.yelp.consumerSecret,
      token: config.yelp.token,
      token_secret: config.yelp.tokenSecret
    });

var parseResponse = function(data) {
  // data.businesses
  // check for additional results and call yelp API again.
};

// Get the 22 mile radius of results around san fran.
yelp.geo({ lat: 37.7893709, long: -122.399797, radius: 35405 }, function(error, data) {
  if(error) {
    console.log('Error:', error.data);
  } else {
    parseResponse(data);
  }
});

// store all data objects to MySQL db in organized format.
