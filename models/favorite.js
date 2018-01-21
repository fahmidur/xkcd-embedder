module.exports = function(sharedLibs, models) {
  var protoProps = {};
  protoProps.tableName = 'favorites';
  protoProps.hasTimestamps = true;

  protoProps.user = function() {
    return this.belongsTo(models.User);
  };

  protoProps.comic = function() {
    return this.belongsTo(models.Comic);
  };

  var classProps = {};

  sharedLibs.promise.promisifyAll(protoProps);
  sharedLibs.promise.promisifyAll(classProps);

  return sharedLibs.bookshelf.Model.extend(protoProps, classProps);
};
