var express = require('express');
var request = require('request');
var prettyjson = require('prettyjson');

var app = express();

var xkcd = (function() {
	var cache = {};
	var base = 'http://xkcd.com';
	var infoPart = '/info.0.json';

	var latestURL = base + infoPart;

	function getURL(url, res, id) {
		if(id && cache[id]) { return res.end(cache[id]); }
		console.log('NEW REQUEST');
		request({url: url, json: true}, function(error, response, body) {
			if(!error && response.statusCode === 200) {
				cache[body.num] = JSON.stringify(body);
				res.end(cache[body.num]);
			} else {
				res.end(JSON.stringify({error: true}));
			}
		});
	};
	function getID(req, res) {
		getURL(base + '/' + req.params.id + infoPart, res, req.params.id);

	};
	function getLatest(req, res) {
		getURL(latestURL, res);
	};

	return {
		getLatest: getLatest,
		getID: getID
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
app.get('/:id(\\d+)', allowAccess, xkcd.getID);

app.listen(app.get('port'), function() {
	console.log('Listening on http://localhost:' + app.get('port'));
});