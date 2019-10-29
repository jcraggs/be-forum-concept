const { fetchTopics } = require("../models/m-topics");

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then(topics => res.status(200).json({ topics }))
    .catch(next);
};
