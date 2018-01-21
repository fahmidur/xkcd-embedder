
exports.up = function(knex, Promise) {
  return knex.schema.createTable('comics', function(table) {
    table.increments('id').primary();
    table.string('source');
    table.integer('xid');
    table.json('data');
    table.timestamps();
  }).then();
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('comics').then();
};
