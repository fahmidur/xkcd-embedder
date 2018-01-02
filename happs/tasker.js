#!/usr/bin/env node
console.log('CURRENT_DIRECTORY = ', __dirname);
console.log('PROCESS.cwd = ', process.cwd());

var sharedLibs = {};
var conf = require('../fn_parse_conf')(sharedLibs);
require('../fn_build_shared_libs')(conf, sharedLibs);
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

console.log("Requesting Task: ", taskName);
var taskFn = null;
try {
  taskFn = require("./tasks/"+taskName)(conf, sharedLibs, models);
} catch(err) {
  console.error("Error Fetching Task");
}

if(typeof taskFn !== 'function') {
  console.error("Task Not Found");
  process.exit(1);
}

console.log("Executing Task: ", taskName);
taskFn(function() {
  console.log("******************");
  console.log("Taks Complete");
  process.exit(0);
});
