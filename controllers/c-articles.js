const {
  fetchArticleById,
  updateArticleVotes,
  createComment
} = require("../models/m-articles");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then(article => {
      res.status(200).json({ article });
    })
    .catch(next);
};

exports.patchArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const update = req.body;
  updateArticleVotes(update, article_id)
    .then(updatedArticle => {
      res.status(200).json(updatedArticle);
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;
  createComment(newComment, article_id)
    .then(postedComment => {
      res.status(201).json(postedComment);
    })
    .catch(next);
};
