var should = require('should');
var mongoose = require('mongoose');
var crypto = require('crypto');

mongoose.connect('mongodb://localhost/xkcd-embedder_test');

var User = require('../models/User');

describe('User', function() {
	var user;

	beforeEach(function(done) {
		var timestamp = new Date().getTime();
		console.log(timestamp);
		user = new User({ 
			email: 's.f.reza+'+timestamp+'@gmail.com',
			name: {
				first: 'Syed', 
				last: 'Reza',
			}
		});

		console.log("_________A TEST IS STARTING_____");
		done();
	});

	afterEach(function(done) {
		console.log("-------------------------------------")
		console.log("   ")
		done();
	});

	after(function(done) {
		console.log("___ALL TESTS COMPLETE FOR USER___");
		mongoose.disconnect();
		done();
	});

	it('should not save users with null emails', function(done) {
		user.email = null;
		user.save(function(err) {
			should(err).be.ok;
			done();
		});
	});


	it('should not save new users without passwords', function(done) {
		console.log(user);
		// user.password = null;
		user.save(function(err) {
			should(err).be.ok;
			done();
		});
	});

	it('should not save new users with small passwords', function(done) {
		var password = 'small';
		
		user.password = password;
		user.save(function(err) {
			should(err).be.ok;
			done();
		});
		
	});

	it('should hash the password when setting it and update the user', function(done) {
		var password = 'cookiemonster';
		var password_hash = crypto.createHash('sha256').update(password).digest('base64');

		user.password = password;
		user.save();
		
		user.password_hash.should.eql(password_hash);

		done();
	});

	it('should give me the full name when I do user.name.full', function(done) {
		console.log('Testing User.name.full');
		console.log('user = ', user);
		console.log('user.name.full = ', user.name.full);
		user.name.full.should.eql('Syed Reza');
		done();
	});

	it('should return true when searching for user with correct password', function(done) {
		var password = 'cookiemonster';
		var password_hash = crypto.createHash('sha256').update(password).digest('base64');

		user.password = password;
		user.save();
		

		user.passwordMatches(password).should.eql(true);

		done();
	});

	it('should return false when searching for user with incorrect password', function(done) {
		var password = 'cookiemonster';
		var password_hash = crypto.createHash('sha256').update(password).digest('base64');

		user.password = password;
		user.save();
		

		user.passwordMatches(password+'bla').should.eql(false);

		done();
	});
});
