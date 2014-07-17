var express = require('express');
var request = require('request');
var prettyjson = require('prettyjson');

var app = express();

var xkcd = (function() {
	var cache = {};
	var base = 'http://xkcd.com';
	var infoPart = '/info.0.json';

	var latestURL = base + infoPart;
	var errorJSON = JSON.stringify({error: true});

	function getURL(opt) {
		if(opt.id && cache[opt.id]) { return opt.res.end(cache[opt.id]); }

		console.log('NEW REQUEST', new Date());
		request({url: opt.url, json: true}, function(error, response, body) {
			if(!error && response.statusCode === 200) {
				cache[body.num] = JSON.stringify(body);
				// res.end(cache[body.num]);
				opt.successCallback(opt.res, body);
			} else {
				opt.failureCallback(opt.res);
				// res.end(JSON.stringify({error: true}));
			}
		});
	};

	function bodyWriter(res, body) {
		res.end(JSON.stringify(body));
	};

	function failWriter(res) {
		res.end(errorJSON);
	};

	//--------------------------------
	// PUBLIC
	//--------------------------------
	function getID(req, res) {
		getURL({
			id: req.params.id, // cache
			res: res,
			url: base + '/' + req.params.id + infoPart,
			successCallback: bodyWriter,
			failureCallback: failWriter
		});
	};

	function getLatest(req, res) {
		getURL({
			res: res,
			url: latestURL,
			successCallback: bodyWriter,
			failureCallback: failWriter
		});
	};

	function getRandom(req, res) {
		getURL({
			res: res,
			url: latestURL,
			successCallback: function(res2, body) {
				var latestNum = body.num;
				var randomID = ~~(Math.random() * latestNum)+1;
				// res.end(JSON.stringify({latestNum: latestNum, randomID: randomID}));
				getURL({
					id: randomID, //cache
					res: res,
					url: base + '/' + randomID + infoPart,
					successCallback: bodyWriter,
					failureCallback: failWriter
				});
			},
			failureCallback: failWriter
		});	
	}

	return {
		getLatest: getLatest,
		getID: getID,
		getRandom: getRandom,
	};
})();

app.set('port', 4567);

function allowAccess(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
};

app.get('/latest', allowAccess, xkcd.getLatest);
app.get('/random', allowAccess, xkcd.getRandom);
app.get('/:id(\\d+)', allowAccess, xkcd.getID);

app.listen(app.get('port'), function() {
	console.log('Listening on http://localhost:' + app.get('port'));
});