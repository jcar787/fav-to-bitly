// favTobitly.js
// convert links that you fav and have a certain hashtag 
// or search term and save them in bitly 
// is going to use for testing purposes the old apis
var http = require("http");
var bitly = require("bitly");


var bitlyUser = function(user, key) {
	this.user = user;
	this.key = key;
	this.bitly = new bitly(user, key);
	return this;
};

bitlyUser.prototype.shorten = function(url) {
	this.bitly.shorten(url, function(err, res) {
		if(err)
			console.log(err);
		else
			console.log(res.data.url, "saved!");
	});
};

var twitterUser = function(user, search) {
	this.user = user;
	this.search = search;
	this.count = 1;
	this.options = {
		headers: { 'content-type': 'application/json' },
		port: 80,
		host:"api.twitter.com",
		path:"/1/favorites.json?screen_name="+user+"&trim_user=true&count=200&page="+this.count};
	this.text = [];
	return this
};

twitterUser.prototype.updatePath = function() {
	var n = this.options.path.lastIndexOf("=");
	var path = this.options.path.substring(0,n+1)+(++this.count);
	this.options.path = path;
}

twitterUser.prototype.readFavs = function(cb) {
	var data = "";
	var self = this;
	var last = false;
	console.log(this.options.path);
	http.get(this.options, function(res) {
		res.on("data", function(chunk) {
			data += chunk;
		});
		
		res.on("end", function() {
			console.log("entered end");
			var results = JSON.parse(data);
			if(results && results.length > 0) {
				if(results.length < 200)
					last = true;				
				results.forEach(function(result, i) {
					self.text.push(result.text);
					if(i+1 == results.length) {
						if(!last) {
							self.updatePath();
							self.readFavs();
						}
						else {
							console.log(self.text.length);
							cb(self.text);
						}
					}
				});
			}
			else {
				console.log(self.text.length);
				cb(self.text);
			}
		});
		
		res.on("error", function(e) {
			console.log("entered error");
			console.log(e);
		});
	});
}

var saveLink = function(bitlyUser, twitterUser) {
	this.bitlyUser = bitlyUser;
	this.twitterUser= twitterUser;
	this.regex = new RegExp("http://t.co/[A-Za-z0-9]+");;
	return this;
};

saveLink.prototype.saveLinks = function() {
	self = this;
	this.twitterUser.readFavs(function(favs) {
		favs.forEach(function(fav, i) {
			//console.log(fav.indexOf(self.twitterUser.search));
			if(fav.indexOf(self.twitterUser.search) > -1) {
				if(self.regex.test(fav))
					self.bitlyUser.shorten(self.regex.exec(fav)[0]);
			}				
			if(i+1 === favs.length)
				console.log("finished");
		});
	});
};

module.exports.bitly = bitlyUser;
module.exports.twitter = twitterUser;
module.exports.saveLink = saveLink;
