var should = require('should');
var seqCap = require('../lib/seqCaptcha');

describe('seqCap', function() {
	it('should return a generated sequence', function(done) {
		var seq = seqCap.generateSequence(10);
		should(seq).be.ok;
		console.log('Sequence = ', seq);
		done();
	});
});