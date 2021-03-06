'use strict';

// this is fun
module.change_code = 1;
const _ = require('lodash');
const Alexa = require('alexa-app');
const app = new Alexa.app('airportinfo');
const FAADataHelper = require('./faa_data_helper');

app.launch(function(req, res) {
  let prompt = 'For delay information, tell me an Airport code.';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('airportinfo',
  {
    'slots': {
      'AIRPORTCODE': 'FAACODES'
    },
    'utterances': ['{|flight|airport} {|delay|status} {|info|information} {|for|at} {-|AIRPORTCODE}']
  },
  function(req, res) {
    //get the slot
    let airportCode = req.slot('AIRPORTCODE');
    let reprompt = 'Tell me an airport code to get delay information.';
    if (_.isEmpty(airportCode)) {
      let prompt = 'I didn\'t hear an airport code. Tell me an airport code.';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      return true;
    } else {
      let faaHelper = new FAADataHelper();
      faaHelper.requestAirportStatus(airportCode).then(function(airportStatus) {
        console.log(airportStatus);
        res.say(faaHelper.formatAirportStatus(airportStatus)).shouldEndSession(true).send();
      }).catch(function(err) {
        console.log(err.statusCode);
        let prompt = 'I didn\'t have data for an airport code of ' + airportCode;
        res.say(prompt).reprompt(reprompt).shouldEndSession(true).send();
      });
      return false;
    }
  }
);

var exitFunction = function(request, response) {
  var speechOutput = 'Goodbye!';
  response.say(speechOutput);
};
app.intent('AMAZON.StopIntent', exitFunction);
app.intent('AMAZON.CancelIntent', exitFunction);

app.intent('AMAZON.HelpIntent', function(request, response) {
  let speechOutput = 'To request information on an airport, request it by it\'s status code.' +
    'For example, to get information about atlanta hartsfield airport, say airport status for ATL';
  response.say(speechOutput);
});

module.exports = app;
