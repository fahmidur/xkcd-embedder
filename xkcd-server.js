var request = require('request');

var config = require('./config');

var models = require('./models');

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var async = require('async');

var app = express();
app.set('view engine', 'ejs');
app.set('views', './');

app.use(session({
  name: 'xkcd_embedder.sid',
  secret: config.hashes.join(''),
  saveUninitialized: false, // Do not save sessions that are new but not modified
  resave: true, // Do not write session back to Redis if it did not change
  rolling: true,
}));

app.use(function(req, res, next) {
  //console.log('--- session = ', (req.session));
  next();
});

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
		if(opt.id && cache[opt.id]) { return opt.res.json({ok: true, data: cache[opt.id]}); }

		request({url: opt.url, json: true}, function(error, response, body) {
			if(!error && response.statusCode === 200) {
				cache[body.num] = body;
				opt.successCallback(opt.res, body);
			} else {
				opt.failureCallback(opt.res);
			}
		});
	};

	function bodyWriter(res, body) {
		res.json({ok: true, data: body});
	};

	function failWriter(res) {
		res.json({ok: false, errors: ['Failed to fetch Data from XKCD Server']});
	};

	//--------------------------------
	// PUBLIC
	//--------------------------------
	function getID(req, res) {
		getURL({
			id: req.params.id,
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

		models.User.query({where: {email: email}}).fetch().then(function(user) {
			if(!user) {
				res.json({ok: false, error: 'User ' + email + ' not found'});
				return;
			}
      if(!user.isPasswordCorrect(password)) {
        res.json({ok: false, error: 'Invalid password'});
        return;
      }
      req.session.user = user.publicAttributes();
      //user.logLogin(); // Updates the last login attribute
      res.json({ok: true, user: req.session.user});
		});
	}

	function getFavorites(req, res) {
		if(!(req.session && req.session.user)) {
			return res.json({ok: false, errors: ['not logged in']});
		}
    return res.json({ok: false, errors: ['not implemented']});
		//models.User.findOne(req.session.user.email, function(err, user) {
			//if(err || !user) {
				//return res.json({ok: false, error: 'user not found'});
			//}
			//res.json(user.favorites_XKCD);
		//});
	};

	function addFavorite(req, res) {
		if(!(req.session && req.session.user)) {
			return res.json({ok: false, error: 'not logged in'});
		}
    var num = req.params.num;
    if(!num){
      return res.json({ok: false, error: 'expecting param num as comic number'});
    }
    var user = res.locals.user;

    models.Favorite.query({where: {user_id: user.attributes.id, comic_id_tmp: num}}).fetch().then(function(favExisting) {
      if(favExisting) {
        return res.json({ok: true, message: 'already a favorite. moot operation'});
      }
      var fav = new models.Favorite({user_id: user.attributes.id, comic_id_tmp: num});
      models.Comic.query({where: {id: num}}).fetch().then(function(comic) {
        if(!comic) {
          return saveFav();
        }
        fav.set('comic_id', num);
        saveFav();
      });
      function saveFav() {
        fav.save().then(function() {
          return res.json({ok: true, message: 'favorite added'});
        });
      }
    });

	}

	function delFavorite(req, res) {
		if(!(req.session && req.session.user)) {
			return res.json({ok: false, error: 'not logged in'});
		}
    var num = req.params.num;
    if(!num){
      return res.json({ok: false, error: 'expecting param num as comic number'});
    }
    var user = res.locals.user;
    models.Favorite.query({where: {user_id: user.attributes.id, comic_id: num}}).fetch().then(function(favExisting) {
      if(!favExisting) {
        res.json({ok: false, error: 'No such favorite'});
        return;
      }
      favExisting.destroy().then(function() {
        res.json({ok: true, message: 'favorite deleted'});
      });
    });
	}

	function register(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;

    var errors = [];
    async.parallel([
    function validatePresencePassword(callback) {
      if(!password || password.match(/^\s+$/)) {
        errors.push('Password is blank');
      }
      callback();
    },
    function validatePresencePassword2(callback) {
      if(!password2 || password2.match(/^\s+$/)) {
        errors.push('Password2 is blank');
      }
      callback();
    },
    function validatePasswordsMatch(callback) {
      if(password != password2) {
        errors.push('Passwords do not match');
      }
      callback();
    },
    function validatePresenceEmail(callback) {
      if(!email || email.match(/^\s+$/)) {
        errors.push('Email is blank');
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
      models.User.where('email', email).count().then(function(count) {
        if(count != 0) {
          errors.push('User email is taken');
        }
        callback();
      });
    },
    // TODO: At the moment we have no captcha, this is really bad
		//function validateCaptchaPassed(callback) {
			//console.log(req.session);
			//if(!seqCap.isCorrect(req)) {
				//errors.push('Captcha answer is incorrect.');
			//}
			//callback();
		//}
		], function() {
			if(errors.length > 0) {
        res.json({ok: false, errors: errors});
        return;
			}
      var user = new models.User;
      user.set('email', email);
      user.setPassword(password);
      user.save().then(function() {
        res.json({ok: true, user: user});
      });
		});
	}

	function isLoggedIn(req, res) {
		if(req.session && req.session.user) {
			res.json({isLoggedIn: true, user: req.session.user });
		} else {
			res.json({isLoggedIn: false});
		}
	}

  function seeSession(req, res) {
    res.json(req.session);
  }

	function logout(req, res) {
		if(req.session && req.session.user) {
			res.json({ok: true, user_email: req.session.user.email });
			req.session.destroy();
		}
		else {
			res.json({ok: false});
		}
	}

  function setUser(req, res, next) {
    console.log('--- setUser --- req.path = ', req.path);
    var suser = req.session.user;
    if(!(suser && suser.email)) {
      res.json({ok: false, error: 'Expecting logged in user'});
      return;
    }
    models.User.query({where: {email: suser.email}}).fetch().then(function(user) {
      console.log('--- user found. user = ', user);
      res.locals.user = user;
      next();
    });
  }

	return {
		getLatest: getLatest,
		getID: getID,
		getRandom: getRandom,
		register: register,
		login: login,
		logout: logout,
		isLoggedIn: isLoggedIn,

    setUser: setUser, 

    seeSession: seeSession,

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

app.get('/seeSession', allowAccess, xkcd.setUser, xkcd.seeSession);
app.get('/favorites', allowAccess, xkcd.setUser, xkcd.getFavorites);
app.get('/favorites/add/:num(\\d+)', allowAccess, xkcd.setUser, xkcd.addFavorite);
app.get('/favorites/del/:num(\\d+)', allowAccess, xkcd.setUser, xkcd.delFavorite);


if(process.env.MODE == 'debug') {
  console.log('--- DEBUG REPL ---');
  var repl = require('repl');
  var replServer = repl.start('> ');
  var context = replServer.context;
  context.config = config;
  context.models = models;

  replServer.defineCommand('exit', function() {
    process.exit(1);
  });

} else {
	app.listen(app.get('port'), function() {
		console.log('Listening on http://'+config.host.name+':' + config.host.port);
	});	
}
