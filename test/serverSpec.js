var request = require('supertest'),
    config      = require('../config.js'),
    express     = require('express'),
    url         = require('url'),
    app      = require('../server');
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

describe('GET /points', function() {
  it("should create a new org with valid privileges and input with status 201", function(done) {
    request(app)
      .get("/points/")
      .send({ lat: 37.783594, long:  -122.408904 })
      .expect(201)
      .end(function(err, res) {
        console.log(res);
        res.body.should.include("response");
        done();
      });
  });
});