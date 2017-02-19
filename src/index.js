var Alexa = require('alexa-sdk');
var FeedParser = require('feedparser');
var striptags = require('striptags');
var request = require('request');

var location = "Werder Havel";
var welcomeRepromt = "Du kannst mich nach lokalen Neuigkeiten fragen oder sag Hilfe. Was soll es sein?";
var welcomeMessage = location + " City Guide. " + welcomeRepromt;
var helpMessage = "Folgende Dinge kannst du mich fragen: Erzähl mir von " + location + ". Erzähl mir die lokalen Neuigkeiten.  Was soll es sein?";
var goodbyeMessage = "OK, viel Spass in " + location + ".";
var newsIntroMessage = "Hier sind die Neuigkeiten für " + location + ". ";
var moreInfoMessage = " Schaue in deine Alexa app für mehr Informationen.";
var dataErrorMessage = "Es gab ein Problem beim Abruf der Daten. Bitte versuche es noch einmal.";

var states = {
	FETCHMODE: '_FETCHMODE'
};

var alexa;

var newSessionHandlers = {
    'LaunchRequest': function() {
        this.handler.state = states.FETCHMODE;
        this.emit(':ask', welcomeMessage, welcomeRepromt);
    },
    'getNewsIntent': function() {
        this.handler.state = states.FETCHMODE;
        this.emitWithState('getNewsIntent');
    },
    'Unhandled': function() {
        this.emit(':ask', helpMessage, welcomeRepromt);
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', goodbyeMessage);
    },
    'SessionEndedRequest': function() {
        this.emit('AMAZON.StopIntent');
    }
};

var startSearchHandlers = Alexa.CreateStateHandler(states.FETCHMODE, {
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', helpMessage, helpMessage);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', goodbyeMessage);
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
    		alexa.emit(':tell', dataErrorMessage);
    	});
    	feedparser.on('error', function (error) {
			console.log("PARSING ERROR: " + error);
    		alexa.emit(':tell', dataErrorMessage);
    	});
    	feedparser.on('readable', function () {
			var stream = this;
    	  
			var cardTitle = location + " Neuigkeiten";
			var cardContent = "Daten von Werder Life\n\n";
    	  
			var output = newsIntroMessage;
    	  
			var index = 1;
			var item;
			while (item = stream.read()) {    		      		  
				var headline = striptags(item.title) + ". " + striptags(item.description);
    		      		  
				output += " Neuigkeit " + index + ": " + headline;

				cardContent += " Neuigkeit " + index + ".\n";
				cardContent += headline + "\n\n";
				
				index++;
			}
			output += moreInfoMessage;
			alexa.emit(':tellWithCard', output, cardTitle, cardContent);
    	});
    },
    'SessionEndedRequest': function () {
        this.emit('AMAZON.StopIntent');
    },
    'Unhandled': function () {
        this.emit(':ask', helpMessage, helpMessage);
    }
});

exports.handler = function (event, context, callback) {
    alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers, startSearchHandlers);
    alexa.execute();
};
