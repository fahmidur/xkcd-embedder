module.exports = function(sharedLibs, models) {
  //--- Dependencies
  sharedLibs.bcrypt = sharedLibs.bcrypt || require('bcrypt-nodejs');

  var protoProps = {};
  protoProps.tableName = 'users';
  protoProps.hasTimestamps = true;

  protoProps.isPasswordCorrect = function(password) {
    var self = this;
    return sharedLibs.bcrypt.compareSync(password, self.attributes.password_bcrypt);
  };

  var classProps = {};

  sharedLibs.promise.promisifyAll(protoProps);
  sharedLibs.promise.promisifyAll(classProps);

  //console.error('--------------- sharedLibs.bookshelf = ', sharedLibs.bookshelf);
  return sharedLibs.bookshelf.Model.extend(protoProps, classProps);
};
