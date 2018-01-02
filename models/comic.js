module.exports = function(sharedLibs, models) {
  var protoProps = {};
  protoProps.tableName = 'comics';
  protoProps.hasTimestamps = true;

  var classProps = {};

  sharedLibs.promise.promisifyAll(protoProps);
  sharedLibs.promise.promisifyAll(classProps);

  return sharedLibs.bookshelf.Model.extend(protoProps, classProps);
};
