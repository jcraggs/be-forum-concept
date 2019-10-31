const commentsRouter = require("express").Router();
const { methodNotAllowed } = require("../utils/errorHandler");
const {
  patchCommentVotes,
  deleteComment
} = require("../controllers/c-comments");

commentsRouter
  .route("/:comment_id")
  .delete(deleteComment)
  .patch(patchCommentVotes)
  .all(methodNotAllowed);

module.exports = commentsRouter;
