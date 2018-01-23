var promise = require('bluebird');
var bookshelf = require('./bookshelf');

module.exports = function(protoProps, classProps) {
  promise.promisifyAll(protoProps);
  promise.promisifyAll(classProps);
  return bookshelf.Model.extend(protoProps, classProps);
};
