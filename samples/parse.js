var FeedParser = require('feedparser');
var request = require('request');
var striptags = require('striptags');

var req = request('http://werder-life.de/feed/');
var feedparser = new FeedParser();

req.on('response', function (res) {
  var stream = this; // `this` is `req`, which is a stream

  if (res.statusCode !== 200) {
    this.emit('error', new Error('Bad status code'));
  }
  else {
    stream.pipe(feedparser);
  }
});

req.on('error', function (error) {
  // handle any request errors
});

feedparser.on('error', function (error) {
  // always handle errors
});

feedparser.on('readable', function () {
  // This is where the action is!
  var stream = this; // `this` is `feedparser`, which is a stream
  var item;

  while (item = stream.read()) {
    console.log(striptags(item.title));
    console.log(striptags(item.description));
    console.log("");
  }
});