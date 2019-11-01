const {
  fetchArticleById,
  updateArticleVotes,
  createComment,
  fetchComments,
  fetchAllArticles
} = require("../models/m-articles");

exports.getAllArticles = (req, res, next) => {
  const { sort_by, order, author, topic } = req.query;
  fetchAllArticles(sort_by, order, author, topic)
    .then(articles => {
      res.status(200).json({ articles });
    })
    .catch(next);
};

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
      res.status(200).send({ article: updatedArticle });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;
  createComment(newComment, article_id)
    .then(postedComment => {
      res.status(201).json({ comment: postedComment });
    })
    .catch(next);
};

exports.getCommentsByArticleID = (req, res, next) => {
  const { article_id } = req.params;
  const { sort_by, order } = req.query;
  fetchComments(article_id, sort_by, order)
    .then(articleComments => {
      res.status(200).json({ comments: articleComments });
    })
    .catch(next);
};
