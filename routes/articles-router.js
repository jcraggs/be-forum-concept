const articlesRouter = require("express").Router();
const {
  getArticleById,
  patchArticleVotes
} = require("../controllers/c-articles");
const { methodNotAllowed } = require("../utils/errorHandler");

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVotes)
  .all(methodNotAllowed);

module.exports = articlesRouter;
