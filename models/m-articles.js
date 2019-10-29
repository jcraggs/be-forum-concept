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
  return connection
    .first()
    .from("articles")
    .where({ article_id: inputArticle_id })
    .increment("votes", update.inc_votes)
    .returning("*")
    .then(response => {
      return response[0];
    });
};

module.exports = { fetchArticleById, updateArticleVotes };
