var Alexa = require('alexa-sdk');
var FeedParser = require('feedparser');
var striptags = require('striptags');
var request = require('request');
var config = require('./config');

var states = {
	NEWSMODE: '_NEWSMODE'
};

var alexa;

var newSessionHandlers = {
    'NewSession': function() {
        this.handler.state = states.NEWSMODE;
        this.emit(':ask', config.welcomeMessage, config.welcomeRepromt);
    }
};

var newsModeHandler = Alexa.CreateStateHandler(states.NEWSMODE, {
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', config.helpMessage, config.helpMessage);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', config.goodbyeMessage);
    },
    'getNewsIntent': function () {
		var index = 1;
		
		var cardContent = "";
		var output = config.newsIntroMessage;
		
    	var feedparser = new FeedParser();
    	var req = request(config.endpoint);
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
    	  
			var item;
			while (item = stream.read()) {
				var title = striptags(item.title);
				var description = striptags(item.description)

				//output += config.newsString + " " + index + ": " + headline + " ";
				output += config.newsString + " " + index + ": " + title + ". ";

				cardContent += config.newsString + " " + index + ".\n";
				cardContent += title + ". " + description + "\n\n";
				
				index++;
			}
    	});
    	feedparser.on('end', function () {
			output += config.moreInfoMessage;
			alexa.emit(':tellWithCard', output, config.cardTitle, cardContent);
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
	alexa.registerHandlers(newSessionHandlers, newsModeHandler);
    alexa.execute();
};
