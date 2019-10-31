const articlesRouter = require("express").Router();
const {
  getArticleById,
  patchArticleVotes,
  postComment,
  getCommentsByArticleID,
  getAllArticles
} = require("../controllers/c-articles");
const { methodNotAllowed } = require("../utils/errorHandler");

articlesRouter
  .route("/")
  .get(getAllArticles)
  .all(methodNotAllowed);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVotes)
  .all(methodNotAllowed);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleID)
  .post(postComment)
  .all(methodNotAllowed);

module.exports = articlesRouter;
