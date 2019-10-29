const { fetchArticleById } = require("../models/m-articles");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then(article => {
      res.status(200).json({ article });
    })
    .catch(next);
};
