var chai = require('chai');
var assert = chai.assert;
var Comic = require('../../models/comic');

describe("Comic", function() {
  it("should be able to forge a new comic", function() {
    var newComic = Comic.forge({
      xid: 99,
      source: 'xkcd',
    });
    assert(newComic !== null);
    console.log('newComic = ', newComic);
  });
});
