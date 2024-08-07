var fs = require('fs');
var pj = require('prettyjson');

var config = JSON.parse(fs.readFileSync('config.json'));
env = process.env.NODE_ENV || "development";
config = config[env];
if(!config) {
  throw "No config data found for environment";
}
console.log("config = \n---\n", pj.render(config), "\n---\n");
console.log("config.knex = \n---\n", pj.render(config.knex), "\n---\n");

//if(config.redis) {
  //config.redis.prefix = 'xemb:' + env + ':';
//}

var port = config.host.port;
config.host.xurl = '//'+config.host.name+( (port == 80 || port == 443) ? '' : ':'+port )

module.exports = config;
