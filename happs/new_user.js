var mongoose = require('mongoose');
var crypto = require('crypto');
var prompt = require('prompt');
var prettyjson = require('prettyjson');

mongoose.connect('mongodb://localhost/xkcd-embedder');
var User = require('../models/User');

prompt.start();
prompt.get(['email', 'firstname', 'lastname', 'password'], function(err, res) {
	if(err) { return onErr(err); }

	console.log('email: ', res.email);
	console.log('firstname: ', res.firstname);
	console.log('lastname: ', res.lastname);
	console.log('password: ', res.password);

	var user = new User({
		email: res.email,
		name: {
			first: res.firstname,
			last: res.lastname,
		}
	});

	user.password = res.password;
	user.save(function(err) {
		if(err) {
			console.log("Error saving user! " + err);
			done(); return;
		}
		console.log("User saved!");
		done();	
	});
	
});

function done() {
	mongoose.disconnect();
}