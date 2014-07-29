function sequenceCaptcha() {
	function randInclusive(a, b) {
		return Math.floor(Math.random()*(b-a+1)) + a;
	}

	function generateSequence(n) {
		if(!n) { n = this.length; }
		var seq = new Array();

		var incLimit = 10;
		var initLimit = 200;
		var incincLimit = 5;

		var incBy = randInclusive(1, incLimit);
		var incincBy = (Math.random() > 0.5 ? -1 : 1) * randInclusive(1, incincLimit);
		var mult = (Math.random() > 0.5) ? -1 : 1;



		var last = randInclusive(1, initLimit);
		var current = 0;
		seq.push(last);
		for(var i = 1; i < n; i++) {
			current = last + (mult*incBy);
			seq.push(current);
			incBy += incincBy;
			last = current;
		}

		return seq;
	}

	/**
	 * GET /seqCap/fetch
	 */
	function fetch(req, res) {
		var seq = generateSequence(10);
		var answer = seq.pop();
		req.session.seqCapSequence = seq;
		req.session.seqCapAnswer = answer;
		req.session.seqCapCorrect = false;
		console.log('ANSWER = ', answer);
		res.end(JSON.stringify({sequence: seq}));
		return [seq, answer];
	}

	/**
	 * POST /seqCap/check
	 * EXPECTS req.params.answer
	 * RETURNS true || false
	 */
	function check(req, res) {
		var answer = req.body.answer;
		var ret = false;
		if(req.session.seqCapAnswer) {
			if(req.session.seqCapAnswer === parseInt(answer)) {
				ret = true;
			}
		}
		req.session.seqCapSequence = null;
		req.session.seqCapAnswer = null;

		res.end(ret+'');
		req.session.seqCapCorrect = ret;

		console.log('******* req.session.seqCapCorrect = ', req.session.seqCapCorrect);
		return ret;
	}

	function isCorrect(req) {
		if(req.session.seqCapCorrect) {
			return true;
		}
		return false;
	}

	return {
		fetch: fetch,
		check: check,
		isCorrect: isCorrect, // Not exposed via HTTP. Should Not Be.
		generateSequence: generateSequence
	}
};

// Singletone export pattern
// This is also used by Mongoose
module.exports = exports = new sequenceCaptcha()