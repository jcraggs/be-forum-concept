const topicsRouter = require("express").Router();
const { getTopics } = require("../controllers/c-topics");

topicsRouter.route("/").get(getTopics);

module.exports = topicsRouter;
