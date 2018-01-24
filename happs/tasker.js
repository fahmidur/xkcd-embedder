#!/usr/bin/env node

console.log('CURRENT_DIRECTORY = ', __dirname);
console.log('PROCESS.cwd = ', process.cwd());

var config = require('../config');
var models = require('../models');

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
  taskFn = require("./tasks/"+taskName)(config, models);
} catch(err) {
  console.error("Error Fetching Task, err = ", err);
}

if(typeof taskFn !== 'function') {
  console.error("Task Not Found");
  process.exit(1);
}

console.log("Executing Task: ", taskName);
taskFn(taskArgs, function(exitcode) {
  exitcode = typeof exitcode === 'undefined' ? 0 : exitcode;

  console.log("******************");
  console.log("Task Complete");

  process.exit(exitcode);
});
