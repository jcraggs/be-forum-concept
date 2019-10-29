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
      return response[0];
    });
};

module.exports = { fetchArticleById };
