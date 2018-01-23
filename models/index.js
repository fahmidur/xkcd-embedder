/*
module.exports = function(sharedLibs) {
  var exp = {};

  exp.User = require('./user.js')(sharedLibs, exp);
  exp.Comic = require('./comic.js')(sharedLibs, exp);
  exp.Favorite = require('./favorite.js')(sharedLibs, exp);
  return exp;
};
*/

var exp = {};
exp.User = require('./user');
exp.Comic = require('./comic');
exp.Favorite = require('./favorite');
module.exports = exp;
