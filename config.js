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

module.exports = config;
