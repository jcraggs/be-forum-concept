const connection = require("../db/connection.js");

const updateCommentVotes = (inputComment_id, update) => {
  if (isNaN(update.inc_votes) && update.inc_votes !== undefined) {
    return Promise.reject({
      status: 400,
      msg:
        "Error: update value input for votes patch method should be an integer"
    });
  }

  if (update.inc_votes === undefined) {
    updateKey = Object.keys(update);
    return Promise.reject({
      status: 400,
      msg: `Error: the sent patch key "${
        updateKey[0]
      }" is invalid. The input for the send patch request on the "/api/comments/:comment_id" end point is limited to changing vote counts and therefore must be formatted as follows: { 'inc_votes': [integer] }`
    });
  }

  return connection
    .first()
    .from("comments")
    .where({ comment_id: inputComment_id })
    .increment("votes", update.inc_votes)
    .returning("*")
    .then(response => {
      if (!response[0]) {
        return Promise.reject({
          status: 404,
          msg: "Error: patch failed, comment does not exist"
        });
      } else return response[0];
    });
};

const removeComment = inputComment_id => {
  return connection
    .select("*")
    .from("comments")
    .where("comment_id", inputComment_id)
    .returning("*")
    .del()
    .then(response => {
      if (!response[0]) {
        return Promise.reject({
          status: 404,
          msg: "Error: delete failed, comment does not exist"
        });
      } else return response[0];
    });
};

module.exports = { updateCommentVotes, removeComment };
