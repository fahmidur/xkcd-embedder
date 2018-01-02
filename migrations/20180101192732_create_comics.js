
exports.up = function(knex, Promise) {
  return knex.schema.createTable('comics', function(table) {
    table.integer('xid');
    table.jsonb('data');
  }).then();
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('comics').then();
};
