var fs = require('fs');
var prettyjson = require('prettyjson');
knex_configs = {};

console.log("* Knex. Knexfile. Reading Conf");
conf = JSON.parse(fs.readFileSync('config.json'));
console.log("* Knex. Knexfile. Reading Conf Complete");

for(var env in conf) { var c = conf[env];
  knex_configs[env] = c['knex'];
}

console.log("* Knex. Knexfile. Config = \n", prettyjson.render(knex_configs));
module.exports = knex_configs;
