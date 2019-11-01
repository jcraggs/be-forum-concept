const topicsRouter = require("express").Router();
const { getTopics } = require("../controllers/c-topics");
const { methodNotAllowed } = require("../utils/errorHandler");

topicsRouter
  .route("/")
  .get(getTopics)
  .all(methodNotAllowed);

module.exports = topicsRouter;
