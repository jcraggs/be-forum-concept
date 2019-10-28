exports.up = function(knex) {
  console.log("Creating topics table");
  return knex.schema.createTable("topics", topicsTable => {
    topicsTable
      .string("slug")
      .primary()
      .unique();
    topicsTable.string("description").notNullable();
  });
};

exports.down = function(knex) {
  console.log("Removing topics table");
  return knex.schema.dropTable("topics");
};
