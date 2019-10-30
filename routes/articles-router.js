const articlesRouter = require("express").Router();
const {
  getArticleById,
  patchArticleVotes,
  postComment
} = require("../controllers/c-articles");
const { methodNotAllowed } = require("../utils/errorHandler");

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVotes)
  .all(methodNotAllowed);

articlesRouter
  .route("/:article_id/comments")
  .post(postComment)
  .all(methodNotAllowed);

module.exports = articlesRouter;
