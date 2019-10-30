const connection = require("../db/connection.js");

const fetchArticleById = inputArticle_id => {
  return connection
    .select("articles.*")
    .from("articles")
    .where({ "articles.article_id": inputArticle_id })
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .count("comment_id as comment_count")
    .groupBy("articles.article_id")
    .then(response => {
      if (!response[0]) {
        return Promise.reject({
          status: 404,
          msg: "Error: article does not exist"
        });
      } else return response[0];
    });
};

const updateArticleVotes = (update, inputArticle_id) => {
  if (isNaN(update.inc_votes) && update.inc_votes !== undefined) {
    return Promise.reject({
      status: 400,
      msg:
        "Error: update value input for votes patch method should be an integer"
    });
  }

  if (update.inc_votes === undefined) {
    updateKey = Object.keys(update);
    return Promise.reject({
      status: 400,
      msg: `Error: the sent patch key "${
        updateKey[0]
      }" is invalid. The input for the send patch request on the "/api/articles/:article_id" end point is limited to changing vote counts and therefore must be formatted as follows: { 'inc_votes': [integer] }`
    });
  }

  return connection
    .first()
    .from("articles")
    .where({ article_id: inputArticle_id })
    .increment("votes", update.inc_votes)
    .returning("*")
    .then(response => {
      if (!response[0]) {
        return Promise.reject({
          status: 404,
          msg: "Error: patch failed, article does not exist"
        });
      } else return response[0];
    });
};

module.exports = { fetchArticleById, updateArticleVotes };
