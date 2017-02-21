var config = {};

config.appId = "amzn1.ask.skill.438ee310-cf39-4b57-860a-ba45a52ce948";
config.location = "Werder Havel";
config.welcomeRepromt = "Du kannst mich nach Neuigkeiten fragen oder sag Hilfe. Was soll es sein?";
config.welcomeMessage = config.location + " City Guide. " + config.welcomeRepromt;
config.goodbyeMessage = "OK, viel Spaß in " + config.location + ".";
config.newsIntroMessage = "Hier sind die Neuigkeiten für " + config.location + ". ";
config.moreInfoMessage = " Schaue in deine Alexa app für mehr Informationen.";
config.dataErrorMessage = "Es gab ein Problem beim Abruf der Daten. Bitte versuche es noch einmal.";
config.helpMessage = "Folgende Dinge kannst du mich fragen: Was gibt es Neues in " + config.location + ".";
config.cardTitle = config.location + " Neuigkeiten";
config.endpoint = 'http://werder-life.de/feed/';
config.newsString = 'Neuigkeit';


module.exports = config