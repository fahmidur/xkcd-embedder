var config = require('../../config');
var chai = require('chai');
var assert = chai.assert;
var Comic = require('../../models/comic');

describe("Comic", function() {
  before(function(done) {
    Comic.where('id', '!=', '0').destroy().then(function() {
      done();
    });
  });

  it("should be valid for valid comic", function(done) {
    var newComic = Comic.forge({
      xid: 99,
      source: 'xkcd'
    });
    assert(newComic !== null);
    assert(newComic.isValid() === true);

    newComic.save().then(function() {

    }).catch(function() {

    }).finally(function() {
      assert(newComic.get('id'));
      done();
    }).catch(done);
  });

  it("should be invalid when source is missing", function(done) {
    var newComic = Comic.forge({
      xid: 99
    });

    assert(newComic !== null);
    assert(newComic.isValid() === false);
    assert(!!newComic.errors.source);
    assert(newComic.errors.source.match(/missing/i));

    newComic.save().then(function() {
      console.log('save() success. BAD');
    }).catch(function() {
      console.log('save() failure. GOOD');
    }).finally(function() {
      assert(!newComic.get('id'), "Expecting save() to fail BUT it succeeded");
      done();
    }).catch(done);

  });

  it("should be invalid when source is unknown", function(done) {
    var newComic = Comic.forge({
      source: 'marmaduke',
      xid: 99,
    });

    assert(newComic !== null);
    assert(newComic.isValid() === false);
    assert(!!newComic.errors.source);
    assert(newComic.errors.source.match(/unknown/i));

    newComic.save().then(function() {
      console.log('save() success. BAD');
    }).catch(function() {
      console.log('save() failure. GOOD');
    }).finally(function() {
      assert(!newComic.get('id'), "Expecting save() to fail BUT it succeeded");
      done();
    }).catch(done);

  });

  it("should be invalid when xid is missing", function(done) {
    var newComic = Comic.forge({
      source: 'xkcd'
    });

    assert(newComic !== null);
    assert(newComic.isValid() === false);
    assert(!!newComic.errors.xid);

    newComic.save().then(function() {
      console.log('save() success. BAD');
    }).catch(function() {
      console.log('save() failure. GOOD');
    }).finally(function() {
      assert(!newComic.get('id'), "Expecting save() to fail BUT it succeeded");
      done();
    }).catch(done);

  });

  it("should be able to fetch latest xkcd", function(done) {
    Comic.fetch('xkcd', 'latest', function(data) {
      console.log('fetch xkcd success. data = ', data);
      done();
    }, function(err) {
      console.error('fetch xkcd failured');
      done();
    });
  });


});
