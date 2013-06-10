//test.js
var test = require("./lib");
var bitly = new test.bitly("user", "key");
var twitter = new test.twitter("user", "term/hashtag");
var saveLink = new test.saveLink(bitly, twitter);
saveLink.saveLinks();