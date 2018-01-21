exports.up = function(knex, Promise) {
  return knex.schema.createTable('favorites', function(table) {
    table.increments('id').primary();
    table.timestamps();
    table.integer('user_id').references('users.id');
    table.integer('comic_id').references('comics.id');
    table.integer('comic_id_tmp');
  }).then();
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('favorites').then();
};
