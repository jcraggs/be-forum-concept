const apiRouter = require("express").Router();
const topicsRouter = require("./topics-router");
const usersRouter = require("./users-router");
const articlesRouter = require("./articles-router");
const commentsRouter = require("./comments-router");
const { methodNotAllowed } = require("../utils/errorHandler");
const { getAPIendpoints } = require("../controllers/c-api");

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);

apiRouter
  .route("/")
  .get(getAPIendpoints)
  .all(methodNotAllowed);

module.exports = apiRouter;
