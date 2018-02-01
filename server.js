var express = require('express');
var async = require('async');
var superagent = require('superagent');
var consolidate = require('consolidate');
var bootstrapService = require("express-bootstrap-service");
var _ = require('lodash-node');

// Create app express variable
var app = express();

// Configure template engine
app.engine('html', consolidate.handlebars);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Set path to serve static content from /public folder
app.use(express.static(__dirname + '/public'));

// Use auth key
var keys = require('./keys/credentials');
var api_key = keys.nyt_books;

var secondChord;
var thirdChord;
var fourthChord;
// Get json and provide queries
// Pass api_key and set header
// Render response if no errors
app.get('/', function(req, res, next) {
    async.auto({
        getFirstChords: function(callback) {
          superagent.get('https://api.hooktheory.com/v1/trends/nodes?cp=1')

          .set({ 'Authorization': 'Bearer 1317c4616fbdba61a7f1726730c01467'})

          .end(function(err, response) {
              if (err) {
                return callback(err);
              }
              return callback(null, response.body);
          })
      },
      getSecondChords: ['getFirstChords', function(results, callback) {
        secondChord = results.getFirstChords[0].chord_ID;
        console.log('secondChord**', secondChord);

        superagent.get('https://api.hooktheory.com/v1/trends/nodes?cp=' + secondChord)

        .set({ 'Authorization': 'Bearer 1317c4616fbdba61a7f1726730c01467'})

        .end(function(err, response) {
            if (err) {
              return callback(err);
            }
            return callback(null, response.body);
        })
    }],

    getThirdChords: ['getFirstChords', function(results, callback) {
        thirdChord = results.getFirstChords[1].chord_ID;

        superagent.get('https://api.hooktheory.com/v1/trends/nodes?cp=' + thirdChord)

      .set({ 'Authorization': 'Bearer 1317c4616fbdba61a7f1726730c01467'})

      .end(function(err, response) {
          if (err) {
            return callback(err);
          }
          return callback(null, response.body);
      })
  }],

  getFourthChords: ['getFirstChords', function(results, callback) {
      fourthChord = results.getFirstChords[2].chord_ID;

      superagent.get('https://api.hooktheory.com/v1/trends/nodes?cp=' + fourthChord)

    .set({ 'Authorization': 'Bearer 1317c4616fbdba61a7f1726730c01467'})

    .end(function(err, response) {
        if (err) {
          return callback(err);
        }
        return callback(null, response.body);
    })
}],

    }, function(err, results) {
          _.forEach(results.getFirstChords, function(item) {

              // Round the probability to 1 decimal point
              item.probability = Number((item.probability * 100).toFixed(1));

              // Remove the first number, because we know we're starting with the "I" chord
              item.child_path = item.child_path.substring(2);
          })

          console.log('results.getFirstChords@', results.getFirstChords);
          _.forEach(results.getSecondChords, function(item) {

              // Round the probability to 1 decimal point
              item.probability = Number((item.probability * 100).toFixed(1));

              // Remove the first number, because we know we're starting with the "I" chord
              item.child_path = item.child_path.substring(2);
          })

          console.log('results.getSecondChords@', results.getSecondChords);

          _.forEach(results.getThirdChords, function(item) {
              // Round the probability to 1 decimal point
              item.probability = Number((item.probability * 100).toFixed(1));

              // Remove the first number, because we know we're starting with the "I" chord
              item.child_path = item.child_path.substring(2);
          })

          console.log('results.getThirdChords@', results.getThirdChords);


          _.forEach(results.getFourthChords, function(item) {
              // Round the probability to 1 decimal point
              item.probability = Number((item.probability * 100).toFixed(1));

              // Remove the first number, because we know we're starting with the "I" chord
              item.child_path = item.child_path.substring(2);
          })

          console.log('results.getFourthChords@', results.getFourthChords);

          return res.render('index', {
              firstChords: results.getFirstChords,
              secondChords: results.getSecondChords,
              thirdChords: results.getThirdChords,
             fourthChords: results.getFourthChords,
             secondChord: secondChord,
             thirdChord: thirdChord,
             fourthChord: fourthChord,

              helpers: {
                toJSON : function(object) {
                  return JSON.stringify(object);
                }
              }
          });
        })
});

// Error middleware for 404
app.use(function(err, req, res, next) {
  console.error(err);
  next(err);
});

app.use(bootstrapService.serve);

app.use(function(err, req, res, next) {
  res.status(404);
  res.send('Error 404');
});

// Create server on port 3000
app.listen(3000);
console.log('Express started on port 3000');
