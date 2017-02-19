var Alexa = require('alexa-sdk');
var FeedParser = require('feedparser');
var striptags = require('striptags');
var request = require('request');

var numberOfResults = 3;
var location = "Werder Havel";
var welcomeRepromt = "Du kannst mich nach lokalen Neuigkeiten fragen oder sag Hilfe. Was soll es sein?";
var welcomeMessage = location + " City Guide. " + welcomeRepromt;
var HelpMessage = "Folgende Dinge kannst du mich fragen: Erzähl mir von " + location + ". Erzähl mir die lokalen Neuigkeiten.  Was soll es sein?";
var goodbyeMessage = "OK, viel Spass in " + location + ".";
var newsIntroMessage = "Hier sind die " + numberOfResults + " letzten Neuigkeiten für " + location + ". ";
var moreInfoMessage = " Schaue in deine Alexa app für mehr Informationen.";
var dataErrorMessage = "Es gab ein Problem beim Abruf der Daten. Bitte versuche es noch einmal.";

var states = {
	FETCHMODE: '_FETCHMODE'
};

var alexa;
var output = "";

var newSessionHandlers = {
    'LaunchRequest': function() {
        this.handler.state = states.FETCHMODE;
        output = welcomeMessage;
        this.emit(':ask', output, welcomeRepromt);
    },
    'getNewsIntent': function() {
        this.handler.state = states.FETCHMODE;
        this.emitWithState('getNewsIntent');
    },
    'Unhandled': function() {
        output = HelpMessage;
        this.emit(':ask', output, welcomeRepromt);
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', goodbyeMessage);
    },
    'SessionEndedRequest': function() {
        // Use this function to clear up and save any data needed between sessions
        this.emit('AMAZON.StopIntent');
    }
};

var startSearchHandlers = Alexa.CreateStateHandler(states.FETCHMODE, {
    'AMAZON.HelpIntent': function () {
        output = HelpMessage;
        this.emit(':ask', output, HelpMessage);
    },
    'AMAZON.YesIntent': function () {
        output = HelpMessage;
        this.emit(':ask', output, HelpMessage);
    },
    'AMAZON.NoIntent': function () {
        output = HelpMessage;
        this.emit(':ask', output, HelpMessage);
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
    		output = dataErrorMessage;
    		this.emit(':tell', output);
    	});
    	feedparser.on('error', function (error) {
    		output = dataErrorMessage;
    		this.emit(':tell', output);
    	});
    	feedparser.on('readable', function () {
    	  var stream = this;
    	  var item;

    	  var cardTitle = location + " Neuigkeiten";
    	  var cardContent = "Daten von Werder Life\n\n";
    	  
    	  output = newsIntroMessage;
    	  
    	  var i = 0;
    	  while (item = stream.read() && i < numberOfResults) {
    		  var headline = striptags(item.title) + ". " + striptags(item.description);
    		  var index = i + 1;
    		  output += " Neuigkeit " + index + ": " + headline + ";";

    		  cardContent += " Neuigkeit " + index + ".\n";
    		  cardContent += headline + ".\n\n";
    	  }
    	  output += moreInfoMessage;
    	  alexa.emit(':tellWithCard', output, cardTitle, cardContent);
    	});
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', output, HelpMessage);
    },
    'SessionEndedRequest': function () {
        this.emit('AMAZON.StopIntent');
    },
    'Unhandled': function () {
        output = HelpMessage;
        this.emit(':ask', output, HelpMessage);
    }
});

exports.handler = function (event, context, callback) {
    alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers, startSearchHandlers);
    alexa.execute();
};
