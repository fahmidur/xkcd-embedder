var readline = require('readline');
var fs = require('fs');

module.exports = function(config, sharedLibs, models) {
  return function task(args, done) {
    console.log('--- populate_comics_from_file.js. args = ', args);
    var fpath = args[0];
    
    var comics = {};
    var buf = "";
    function process(str) {
      buf += str;
      var arr = buf.split("\n");
      var didx = [];
      var obj;
      for(var i = 0; i < arr.length; i++) {
        try { obj = JSON.parse(arr[i]); } catch(e) { obj = null; }
        if(obj) {
          didx.push(i);
          //console.log('OBJECT = ', obj.num);
          if(comics[obj.num]) {
            console.error('ALREADY FOUND. obj.num = ', obj.num, 'comics.bla = ', comics[obj.num]);
          }
          comics[obj.num] = obj;
        }
      }
      for(var i = 0; i < didx.length; i++) {
        arr.splice(didx[i], 1);
      }
      buf = arr.join("\n");
    }

    var istream = fs.createReadStream(fpath);
    istream.on('data', function(chunk) {
      console.log('--- chunk = ', chunk, ' length = ', chunk.length);
      var str = new String(chunk);
      process(str);
    });

    istream.on('close', function() {
      done();
    });

  };
};
