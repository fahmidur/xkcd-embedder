module.exports = function(config, sharedLibs, models) {
  return function task(args, done) {
    console.log('--- populate_comics_from_file.js. OVER HERE');
    var fileName = args[0];
    var fs = sharedLibs.fs;
    done();
  };
};
