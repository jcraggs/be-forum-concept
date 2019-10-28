exports.up = function(knex) {
  console.log("Creating users table");
  return knex.schema.createTable("users", usersTable => {
    usersTable
      .string("username")
      .primary()
      .unique();
    usersTable.string("avatar_url").notNullable();
    usersTable.string("name").notNullable();
  });
};

exports.down = function(knex) {
  console.log("Removing users table");
  return knex.schema.dropTable("users");
};
