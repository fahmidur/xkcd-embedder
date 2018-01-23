/*
module.exports = function(sharedLibs, models) {
  sharedLibs.request = sharedLibs.request || require('request');

  var protoProps = {};
  protoProps.tableName = 'comics';
  protoProps.hasTimestamps = true;

  var classProps = {};
  classProps.fetchRemote = function(ident, cbSuccess, cbFailure) {
    var url = 'http://xkcd.com/' + (ident == 'latest' ? '' : (ident+'/')) + 'info.0.json';
    sharedLibs.request({url: url, json: true}, function(err, resp, body) {
      if(err || response.statusCode !== 200) {
        return cbFailure && cbFailure(err, resp);
      }
      return cbSucess && cbSuccess(body);
    });
  };

  sharedLibs.promise.promisifyAll(protoProps);
  sharedLibs.promise.promisifyAll(classProps);

  return sharedLibs.bookshelf.Model.extend(protoProps, classProps);
};
*/

var request = require('request');
var bookshelfer = require('../bookshelfer');

var protoProps = {};
protoProps.tableName = 'comics';
protoProps.hasTimestamps = true;

var classProps = {};
classProps.fetchRemote = function(ident, cbSuccess, cbFailure) {
  var url = 'http://xkcd.com/' + (ident == 'latest' ? '' : (ident+'/')) + 'info.0.json';
  request({url: url, json: true}, function(err, resp, body) {
    if(err || response.statusCode !== 200) {
      return cbFailure && cbFailure(err, resp);
    }
    return cbSucess && cbSuccess(body);
  });
};

module.exports = bookshelfer(protoProps, classProps);
