var mongoose = require('mongoose');
var crypto = require('crypto');
var prompt = require('prompt');
var prettyjson = require('prettyjson');

mongoose.connect('mongodb://localhost/xkcd-embedder');
var User = require('../models/User');

prompt.start();
prompt.get(['email'], function(err, res) {
	if(err) { return onErr(err); }

	console.log('email: ', res.email);
	User.find({'email': res.email}, function(err, docs) {
		if(err) {
			console.log("Err! ", err); done();
			return;
		}
		if(!docs || docs.length == 0) {
			console.log("No such users found"); done();
			return;
		}
		if(docs.length > 1) {
			console.log("Error, more than one user found!");
			for(var i = 0; i < docs.length; ++i) {
				console.log(prettyjson.render(docs[i]['_doc']));
				console.log("----------------------------");
			}
			done();
			return;
		}
		user = docs[0];
		console.log(prettyjson.render(user['_doc']));
		done();
	});

});

function done() {
	mongoose.disconnect();
}