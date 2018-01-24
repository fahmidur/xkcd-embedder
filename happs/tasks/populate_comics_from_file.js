var readline = require('readline');
var fs = require('fs');
var stream = require('stream');
var readline = require('readline');

module.exports = function(config, models) {
  return function task(args, done) {
    console.log('--- populate_comics_from_file.js. args = ', args);

    if(!args.length >= 1) {
      console.error('Expecting filename as argument');
      return done(1);
    }

    var fpath = args[0];
    
    var istream = fs.createReadStream(fpath);
    var ostream = new stream;
    var rl = readline.createInterface(istream, ostream);

    rl.on('line', function(line) {
      if(line.length == 0) {
        return;
      }
      var obj = JSON.parse(line);
      console.log('=== obj = ');
      console.log(obj);
      console.log('===');
      saveComic(obj);
    });

    var finished_timeout = null;

    function saveComic(obj) {
      models.Comic.where({xid: obj.num, source: 'xkcd'}).fetch().then(function(comic) {
        if(!comic) {
          comic = models.Comic.forge({
            xid: obj.num,
            source: 'xkcd',
          });
        }
        comic.set('xdata', obj);
        console.log('=== calling save');
        comic.save().error(function(error) {
          console.error('--- on-error. error = ', error);
        }).catch(function(error) {
          console.error('--- on-catch. error = ', error);
        }).finally(function() {
          console.log('=== comic = ', comic);
          if(finished_timeout) {
            clearTimeout(finished_timeout);
          }
          finished_timeout = setTimeout(function() {
            done();
          }, 1000);
        });
      });
    }

    rl.on('close', function() {
      //done(); // This is premature
    });

  };
};
