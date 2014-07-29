var should = require('should');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/devlog_test');

var Cat = mongoose.model('Cat', { name: String });


describe('Mongoose Test Test', function() {
	beforeEach(function(done) {
		console.log("___STARTING TEST___")
		done();
	});

	afterEach(function(done) {
		console.log("--------------------");
		done();
	});

	after(function(done) {
		console.log("ALL TESTS COMPLETE FOR TEST TEST");
		mongoose.disconnect();

		done();
	});

	it('should create a cat', function(done) {
		var timestamp = new Date() + '';
		var kitty = new Cat({ name: timestamp });
		console.log(kitty);
		kitty.save(function (err) {
		  if (err) {
		  	console.log(err);
		  }
		  console.log('meow');
		  done();
		});
	});
});