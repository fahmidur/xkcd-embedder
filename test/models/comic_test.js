var config = require('../../config');
var chai = require('chai');
var assert = chai.assert;
var Comic = require('../../models/comic');

describe("Comic", function() {
  beforeEach(function(done) {
    Comic.where('id', '!=', '0').destroy().then(function() {
      done();
    });
  });

  it("should be able to forge a new comic", function() {
    console.log('--- config = ', config);
    var newComic = Comic.forge({
      xid: 99,
      source: 'xkcd',
    });
    assert(newComic !== null);
    console.log('newComic = ', newComic);
  });


});
