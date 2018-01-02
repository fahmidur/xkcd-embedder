#!/usr/bin/env node
console.log('CURRENT_DIRECTORY = ', __dirname);
console.log('PROCESS.cwd = ', process.cwd());

//--- SETUP 'environment'
var sharedLibs = {};
sharedLibs.pj = sharedLibs.pj || require('prettyjson');
sharedLibs.fs = sharedLibs.fs || require('fs');

config = JSON.parse(sharedLibs.fs.readFileSync('./config.json'));
env = process.env.NODE_ENV || "development";
config = config[env];
console.log("config = \n---\n", sharedLibs.pj.render(config), "\n---\n");
console.log("config.knex = \n---\n", sharedLibs.pj.render(config.knex), "\n---\n");
//---

sharedLibs.knex = sharedLibs.knex || require('knex')(config.knex);
sharedLibs.bookshelf = sharedLibs.bookshelf || require('bookshelf')(sharedLibs.knex);
sharedLibs.promise = sharedLibs.promise || require('bluebird');

var models = require('../models')(sharedLibs);

console.log('------------------------------------');

function dieWithUsage() {
  console.log("Usage: tasker <name_of_task>");
  process.exit(1);
};

if(process.argv.length <= 2) {
  dieWithUsage();
}

var taskName = process.argv[2];
var taskArgs = process.argv.slice(3);
var m;
for(var i = 0; i < taskArgs.length; i++) {
  if( (m = taskArgs[i].match(/^([0-9\.]+)$/)) ) {
    taskArgs[i] = parseFloat(m[1]);
  }
}
console.log('taskArgs. taskArgs = ', taskArgs);

console.log("Requesting Task: ", taskName);
var taskFn = null;
try {
  taskFn = require("./tasks/"+taskName)(config, sharedLibs, models);
} catch(err) {
  console.error("Error Fetching Task, err = ", err);
}

if(typeof taskFn !== 'function') {
  console.error("Task Not Found");
  process.exit(1);
}

console.log("Executing Task: ", taskName);
taskFn(taskArgs, function() {
  console.log("******************");
  console.log("Task Complete");
  process.exit(0);
});
