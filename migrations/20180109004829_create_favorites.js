exports.up = function(knex, Promise) {
  return knex.schema.createTable('favorites', function(table) {
    table.integer('user_id').references('users.id');
    table.integer('comic_id').references('comics.id');
  }).then();
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('favorites').then();
};
