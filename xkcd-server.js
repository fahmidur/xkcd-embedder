var express = require('express');
var request = require('request');
var prettyjson = require('prettyjson');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var models = require('./models');


var app = express();

var mongodbAddress = 'localhost';
var mongodbName = 'xkcd-embedder';

mongoose.connect('mongodb://' + mongodbAddress + '/' + mongodbName);


app.use(session({
	secret: 'xkcd-is-awseome',
	store: new MongoStore({
		url: 'mongodb://' + mongodbAddress,
		db: mongodbName
	})
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

var xkcd = (function() {
	var cache = {};
	var base = 'http://xkcd.com';
	var infoPart = '/info.0.json';

	var latestURL = base + infoPart;
	var errorJSON = JSON.stringify({error: true});

	function getURL(opt) {
		if(opt.id && cache[opt.id]) { return opt.res.end(cache[opt.id]); }

		// console.log('NEW REQUEST', new Date());
		request({url: opt.url, json: true}, function(error, response, body) {
			if(!error && response.statusCode === 200) {
				cache[body.num] = JSON.stringify(body);
				opt.successCallback(opt.res, body);
			} else {
				opt.failureCallback(opt.res);
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

	function register(req, res) {
		var email = req.body.email;
		var password = req.body.password;

		var user = new models.User({
			email: email,
		});
		user.password = password;
		user.save(function(err) {
			if(err) { 
				res.end('Error saving user: ' + err);
			} else {
				res.end('User saved: ' + user);
			}
		});
	}

	return {
		getLatest: getLatest,
		getID: getID,
		getRandom: getRandom,
		register: register
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

app.use('/', allowAccess, express.static(__dirname + '/public'));
app.use('/js', allowAccess, express.static(__dirname + '/public/js'));
app.use('/css', allowAccess, express.static(__dirname + '/public/css'));

app.get('/latest', allowAccess, xkcd.getLatest);
app.get('/random', allowAccess, xkcd.getRandom);
app.get('/:id(\\d+)', allowAccess, xkcd.getID);
app.post('/register', allowAccess, xkcd.register);


app.listen(app.get('port'), function() {
	console.log('Listening on http://localhost:' + app.get('port'));
});
