var request = require('supertest'),
    config      = require('../config.js'),
    express     = require('express'),
    url         = require('url'),
    app         = require('../server');
    foursquare  = require('node-foursquare-venues')(config.fourSquare.clientId, config.fourSquare.clientSecret);

describe('GET /index.html', function() {
  it('should respond with status code 200 for index.html', function(done) {
    request(app)
      .get('/index.html')
      // .set('Accept', 'application/json')
      // .expect('Content-Type', /json/)
      .expect(200, done);
  })
})

describe('GET /nekothedog', function() {
  it('should respond with status code 404 for unknown points', function(done) {
    request(app)
      .get('/nekothedog')
      .expect(404, done);
  })
})

// describe('GET /points/', function() {
//   it("should return a JSON object", function(done) {
//     request(app)
//       .get("/points/")
//       .expect('Content-Type', /json/)
//       .expect(200, done);
//   })
// })