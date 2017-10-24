module.exports = function(sharedLibs) {
  var exp = {};
  exp.User = require('./user.js')(sharedLibs, exp);
  return exp;
};
