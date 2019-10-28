const {
  topicData,
  articleData,
  commentData,
  userData
} = require("../data/index.js");

const { formatDates, formatComments, makeRefObj } = require("../utils/utils");

exports.seed = function(knex) {
  const topicsInsertions = knex("topics").insert(topicData);
  const usersInsertions = knex("users").insert(userData);
  const articleInsertions = knex("articles")
    .insert(formatDates(articleData))
    .returning("*");

  return knex.migrate
    .rollback()
    .then(() => knex.migrate.latest())
    .then(() => {
      return Promise.all([
        topicsInsertions,
        usersInsertions,
        articleInsertions
      ]);
    })
    .then(insertions => {
      const articleRef = makeRefObj(insertions[2]);
      console.log(articleRef);
      const formattedTime = formatDates(commentData);
      const formattedComments = formatComments(formattedTime, articleRef);
      return knex("comments").insert(formattedComments);
    });
};
