var Alexa = require('alexa-sdk');
var FeedParser = require('feedparser');
var striptags = require('striptags');
var request = require('request');
var config = require('./config');

var states = {
	FETCHMODE: '_FETCHMODE'
};

var alexa;

var newSessionHandlers = {
    'LaunchRequest': function() {
        this.handler.state = states.FETCHMODE;
        this.emit(':ask', config.welcomeMessage, config.welcomeRepromt);
    },
    'getNewsIntent': function() {
        this.handler.state = states.FETCHMODE;
        this.emitWithState('getNewsIntent');
    },
    'Unhandled': function() {
        this.emit(':ask', config.helpMessage, config.welcomeRepromt);
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', config.goodbyeMessage);
    },
    'SessionEndedRequest': function() {
        this.emit('AMAZON.StopIntent');
    }
};

var startSearchHandlers = Alexa.CreateStateHandler(states.FETCHMODE, {
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', config.helpMessage, config.helpMessage);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', config.goodbyeMessage);
    },
    'getNewsIntent': function () {
    	var feedparser = new FeedParser();
    	var req = request('http://werder-life.de/feed/');
    	req.on('response', function (res) {
    		var stream = this;
    		if (res.statusCode !== 200) {
    			this.emit('error', new Error('Bad status code'));
    		} else {
    			stream.pipe(feedparser);
    		}
    	});
    	req.on('error', function (error) {
			console.log("REQUEST ERROR: " + error);
    		alexa.emit(':tell', config.dataErrorMessage);
    	});
    	feedparser.on('error', function (error) {
			console.log("PARSING ERROR: " + error);
    		alexa.emit(':tell', config.dataErrorMessage);
    	});
    	feedparser.on('readable', function () {
			var stream = this;
    	  
			var cardTitle = config.location + " Neuigkeiten";
			var cardContent = "Daten von Werder Life\n\n";
    	  
			var output = config.newsIntroMessage;
    	  
			var index = 1;
			var item;
			while (item = stream.read()) {    		      		  
				var headline = striptags(item.title) + ". " + striptags(item.description);
    		      		  
				output += " Neuigkeit " + index + ": " + headline;

				cardContent += " Neuigkeit " + index + ".\n";
				cardContent += headline + "\n\n";
				
				index++;
			}
			output += config.moreInfoMessage;
			alexa.emit(':tellWithCard', output, cardTitle, cardContent);
    	});
    },
    'SessionEndedRequest': function () {
        this.emit('AMAZON.StopIntent');
    },
    'Unhandled': function () {
        this.emit(':ask', config.helpMessage, config.helpMessage);
    }
});

exports.handler = function (event, context, callback) {
    alexa = Alexa.handler(event, context);
	alexa.appId = config.appId;
	alexa.registerHandlers(newSessionHandlers, startSearchHandlers);
    alexa.execute();
};
