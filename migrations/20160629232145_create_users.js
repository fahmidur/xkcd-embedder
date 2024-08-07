exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments();
    table.string('email').unique();
    table.string('password_bcrypt');
    table.string('password_reset_token').unique();
    table.boolean('email_verified');
    table.string('email_verification_token').unique();
    table.string("login_ip_current");
    table.string("login_ip_last");
    table.dateTime("login_time_current");
    table.dateTime("login_time_last");
    table.timestamps();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
};
