var request = require('request');
var bookshelfer = require('../bookshelfer');


//---

var classProps = {};
classProps.fetchers = {};
classProps.fetchers.xkcd = function fetch_xkcd(ident, cbSuccess, cbFailure) {
  var url = 'http://xkcd.com/' + (ident == 'latest' ? '' : (ident+'/')) + 'info.0.json';
  request({url: url, json: true}, function(err, resp, body) {
    if(err || resp.statusCode !== 200) {
      console.error('fetchers.xkcd. failure. err = ', errr, "\n---");
      return cbFailure && cbFailure(err, resp);
    }
    console.log('fetchers.xkcd. success. body = ', body, "\n---");
    return cbSuccess && cbSuccess(body);
  });
};
classProps.fetch = function fetch(name, ident, cbSuccess, cbFailure) {
  var fetcher = classProps.fetchers[name];
  if(!fetcher) {
    throw "No such fetcher";
  }
  return fetcher(ident, cbSuccess, cbFailure);
};

//---

var protoProps = {};
protoProps.tableName = 'comics';
protoProps.hasTimestamps = true;
protoProps.getErrors = function() {
  var self = this;
  if(!self.get('source')) {
  }
};

//---

module.exports = bookshelfer(protoProps, classProps);
