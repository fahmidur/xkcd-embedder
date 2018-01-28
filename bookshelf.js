var knex = require('./knex');
var bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;
