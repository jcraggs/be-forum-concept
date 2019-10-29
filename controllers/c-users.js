const { fetchUserByUsername } = require("../models/m-users");

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  fetchUserByUsername(username)
    .then(user => {
      res.status(200).json({ user });
    })
    .catch(next);
};
