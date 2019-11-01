const { updateCommentVotes, removeComment } = require("../models/m-comments");

exports.patchCommentVotes = (req, res, next) => {
  const { comment_id } = req.params;
  const update = req.body;
  updateCommentVotes(comment_id, update)
    .then(updatedComment => {
      res.status(200).json({ comment: updatedComment });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(deleteRes => {
      res.status(204).json(deleteRes);
    })
    .catch(next);
};
