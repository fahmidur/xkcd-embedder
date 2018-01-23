/*
module.exports = function(sharedLibs, models) {
  var protoProps = {};
  protoProps.tableName = 'favorites';
  protoProps.hasTimestamps = true;

  protoProps.user = function() {
    return this.belongsTo(models.User);
  };

  protoProps.comic = function() {
    return this.belongsTo(models.Comic);
  };

  var classProps = {};

  sharedLibs.promise.promisifyAll(protoProps);
  sharedLibs.promise.promisifyAll(classProps);

  return sharedLibs.bookshelf.Model.extend(protoProps, classProps);
};
*/

var bookshelfer = require('../bookshelfer');
var request = require('request');

var User = require('./user');
var Comic = require('./comic');


var protoProps = {};
protoProps.tableName = 'favorites';
protoProps.hasTimestamps = true;

protoProps.user = function() {
  return this.belongsTo(User);
};

protoProps.comic = function() {
  return this.belongsTo(Comic);
};

var classProps = {};

module.exports = bookshelfer(protoProps, classProps);

