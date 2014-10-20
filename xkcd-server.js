var express = require('express');
var request = require('request');
var prettyjson = require('prettyjson');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var models = require('./models');
var async = require('async');
var fs = require('fs');


config = JSON.parse(fs.readFileSync('config.json'));
env = process.env.NODE_ENV || "development";
config = config[env]


var app = express();
app.set('view engine', 'ejs');
app.set('views', './');


var mongodbAddress = 'localhost';
var mongodbName = 'xkcd-embedder';

mongoose.connect('mongodb://' + mongodbAddress + '/' + mongodbName);


app.use(session({
	secret: 'xkcd-is-awseome',
	saveUninitialized: true,
	resave: true,
	store: new MongoStore({
		url: 'mongodb://' + mongodbAddress,
		db: mongodbName
	})
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


/**
 * Quick and Dirty Sequence based Captcha
 * Expects res.session to exist
 */
var seqCap = require('./lib/seqCaptcha.js');

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

	function login(req, res) {
		var email = req.body.email;
		var password = req.body.password;

		console.log('** login-email: ', email);
		console.log('** login-password: ', password);

		models.User.findOne({email: email}, function(err, user) {
			if(err || !user) {
				res.end(JSON.stringify({ok: false, error: 'User ' + email + ' not found'}));
				return;
			}
			if(user.passwordMatches(password)) {
				req.session.user = user;
				user.logLogin(); // Updates the last login attribute
				res.end( JSON.stringify({ ok: true, user: user}) );
				return;
			}
			res.end(JSON.stringify({ok: false, error: 'Invalid password'}));
		});
	}

	function getFavorites(req, res) {
		if(!(req.session && req.session.user)) {
			return res.end(JSON.stringify({ok: false, error: 'not logged in'}));
		}
		models.User.findOne(req.session.user.email, function(err, user) {
			if(err || !user) {
				return res.end(JSON.stringify({ok: false, error: 'user not found'}));
			}
			res.end(JSON.stringify(user.favorites_XKCD));
		});
	};

	function addFavorite(req, res) {
		if(!(req.session && req.session.user)) {
			return res.end(JSON.stringify({ok: false, error: 'not logged in'}));
		}
		models.User.findOne(req.session.user.email, function(err, user) {
			if(err || !user) {
				return res.end(JSON.stringify({ok: false, error: 'user not found'}));
			}
			user.favorites_XKCD.addToSet(req.params.num);
			user.save(function(err) {
				if(err) {
					res.end(JSON.stringify({ok: false, error: err}));
				} else {
					res.end(JSON.stringify({ok: true, added: req.params.num }));
				}
			});
		});
	}

	function delFavorite(req, res) {
		if(!(req.session && req.session.user)) {
			return res.end(JSON.stringify({ok: false, error: 'not logged in'}));
		}
		models.User.findOne(req.session.user.email, function(err, user) {
			if(err || !user) {
				return res.end(JSON.stringify({ok: false, error: 'user not found'}));
			}
			user.favorites_XKCD.pull(req.params.num);
			user.save(function(err) {
				if(err) {
					res.end(JSON.stringify({ok: false, error: err}));
				} else {
					res.end(JSON.stringify({ok: true, deleted: req.params.num }));
				}
			});
		});
	}

	function register(req, res) {
		var email = req.body.email;
		var password = req.body.password;

		var user = new models.User({
			email: email,
		});
		user.password = password;


		var errors = [];
		async.parallel([
		function validatePresencePassword(callback) {
			if(!password || password.match(/^\s+$/)) {
				errors.push('Password is blank');
			}
			callback();
		},
		function validatePresenceEmail(callback) {
			if(!email || email.match(/^\s+$/)) {
				errors.push('Email is blank WTF!');
			}
			callback();
		},
		function validateEmailFormat(callback) {
			if(email && !email.match(/^.+\@.+$/)) {
				errors.push('Email format invalid');
			}
			callback();
		},
		function validateEmailUnique(callback) {
			models.User.findOne({email: email}, function(err, user) {
				if(user) {
					errors.push('User email is taken');
				}
				callback();
			});
		},
		function validateCaptchaPassed(callback) {
			console.log(req.session);
			if(!seqCap.isCorrect(req)) {
				errors.push('Captcha answer is incorrect.');
			}
			callback();
		}
		], function() {
			if(errors.length > 0) {
				res.end(JSON.stringify({ok: false, errors: errors}));
			} else {
				user.save(function(err) {
					if(err) {
						res.end(JSON.stringify({ok: false, error: err}));
					} else {
						res.end(JSON.stringify({ok: true, user: user}));
					}
				});
			}

		});
	}

	function isLoggedIn(req, res) {
		// console.log('IS LOGGED IN. SESSION = ', req.session);
		if(req.session && req.session.user) {
			res.end(JSON.stringify({isLoggedIn: true, user: req.session.user }));
		} else {
			res.end(JSON.stringify({isLoggedIn: false}));
		}
	}

	function logout(req, res) {
		if(req.session && req.session.user) {
			// res.end('goodbye ' + req.session.user.email);
			res.end(JSON.stringify({ok: true, user_email: req.session.user.email }));
			req.session.destroy();
		}
		else {
			res.end(JSON.stringify({ok: false}));
		}
	}

	return {
		getLatest: getLatest,
		getID: getID,
		getRandom: getRandom,
		register: register,
		login: login,
		logout: logout,
		isLoggedIn: isLoggedIn,

		getFavorites: getFavorites,
		addFavorite: addFavorite,
		delFavorite: delFavorite
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

// app.all('*', allowAccess, function displaySession(req, res, next) {
// 	// console.log('SESSION = \n', req.session);
// 	next();
// });

// The seqCap routes
app.get('/seqCap/fetch', allowAccess, seqCap.fetch);
app.post('/seqCap/check', allowAccess, seqCap.check);


app.get('/js/xkcd-embedder.js', allowAccess, function(req, res) {
	res.type('text/javascript');
	res.render('public/js/xkcd-embedder.js.ejs', {host: config.host });
});

app.use('/', allowAccess, express.static(__dirname + '/public'));
app.use('/js', allowAccess, express.static(__dirname + '/public/js'));
app.use('/css', allowAccess, express.static(__dirname + '/public/css'));

app.get('/latest', allowAccess, xkcd.getLatest);
app.get('/random', allowAccess, xkcd.getRandom);
app.get('/:id(\\d+)', allowAccess, xkcd.getID);
app.post('/register', allowAccess, xkcd.register);
app.post('/login', allowAccess, xkcd.login);
app.get('/logout', allowAccess, xkcd.logout);
app.get('/isLoggedIn', allowAccess, xkcd.isLoggedIn);
app.get('/favorites', allowAccess, xkcd.getFavorites);
app.get('/favorites/add/:num(\\d+)', allowAccess, xkcd.addFavorite);
app.get('/favorites/del/:num(\\d+)', allowAccess, xkcd.delFavorite);


app.listen(app.get('port'), function() {
	console.log('Listening on http://'+config.host.name+':' + config.host.port);
});