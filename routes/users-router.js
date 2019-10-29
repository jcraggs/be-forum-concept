const usersRouter = require("express").Router();
const { getUserByUsername } = require("../controllers/c-users");
const { methodNotAllowed } = require("../utils/errorHandler");

usersRouter
  .route("/:username")
  .get(getUserByUsername)
  .all(methodNotAllowed);

module.exports = usersRouter;
