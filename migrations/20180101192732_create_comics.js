
exports.up = function(knex, Promise) {
  return knex.schema.createTable('comics', function(table) {
    table.increments('id').primary();
    table.string('source');
    table.string('xid');
    table.json('xdata');
    table.timestamps();

    table.unique(['source', 'xid']);

  }).then();
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('comics').then();
};
