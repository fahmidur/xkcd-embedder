var knex = require('../../knex');
module.exports = function(config, models) {
  return function task(args, done) {
    console.log('xkcd_fetch_comics.js');

    knex.raw("select max(xid::integer) from comics where source='xkcd'").then(function(r) {
      var maxId = r.rows[0].max;
      console.log('=== maxId = ', maxId);
      models.Comic.fetch('xkcd', 'latest', function(data) {
        console.log('=== ltsId = ', data.num); 
        console.log('=== latest = ', data);
        if(data.num == maxId) {
          console.log('=== Already have all comics');
          return done();
        }
        fetchUntil(maxId+1, data.num);
      }, function(err) {
        console.error('=== failed to fetch comic');
        done();
      });
    });

    function fetchUntil(cur, last) {
      if(cur > last) {
        console.log('=== fetchUntil. finished');
        return done();
      }
      models.Comic.fetch('xkcd', cur, function(data) {
        saveComic(data, function() {
          fetchUntil(cur+1, last);
        });
      }, function(err) {
        console.log('=== fetchUntil. models.Comic.fetch failed at. cur = ', cur);
        fetchUntil(cur+1, last);
        return;
      });
    };

    function saveComic(obj, cb) {
      console.log('=== SAVING. obj.num = ', obj.num);
      models.Comic.where({xid: obj.num, source: 'xkcd'}).fetch().then(function(comic) {
        if(!comic) {
          comic = models.Comic.forge({
            xid: obj.num,
            source: 'xkcd',
          });
        }
        comic.set('xdata', obj);
        comic.save().error(function(error) {
          console.error('=== on-error. error = ', error);
        }).catch(function(error) {
          console.error('=== on-catch. error = ', error);
        }).finally(function() {
          console.log('saveComic. done saving. comic.xid = ', comic.get('xid'));
          updateFavorites(comic, cb);
        });
      });
    }

    function updateFavorites(comic, cb) {
      var attr = comic.attributes;
      knex.raw("update favorites set comic_id = "+(attr.id)+" where comic_xid::integer = "+(attr.xid)+" AND comic_source = 'xkcd'").then(function(r) {
        console.log('=== updated favorites');
        cb();
      });
    }

  };
};
