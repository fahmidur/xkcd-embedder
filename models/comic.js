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

classProps.isKnownSource = function(name) {
  return classProps.fetchers[name];
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
protoProps.initialize = function() {
  var self = this;
  self.on('saving', function() {
    if(self.isValid()) { return; }
    throw "Cannot save with errors";
  });
};
protoProps.isValid = function() {
  var self = this;
  self.getErrors();
  return !self.hasErrors;
};
protoProps.getErrors = function() {
  var self = this;
  
  self.errors = {};
  self.hasErrors = false;

  var attr;

  attr = self.get('source');
  if(!attr) {
    self.errors.source = 'Missing source';
  }
  else
  if(!classProps.isKnownSource(attr)) {
    self.errors.source = 'Unknown source';
  }

  attr = self.get('xid');
  if(!attr || (typeof attr == 'string' && attr.match(/^\s+$/))) {
    self.errors.xid = 'Expecting external id';
  }

  if(Object.keys(self.errors).length > 0) {
    self.hasErrors = true;
  }
  return self.errors;
};

//---

module.exports = bookshelfer(protoProps, classProps);
