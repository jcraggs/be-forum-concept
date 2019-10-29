const articlesRouter = require("express").Router();
const { getArticleById } = require("../controllers/c-articles");

articlesRouter.route("/:article_id").get(getArticleById);

module.exports = articlesRouter;
