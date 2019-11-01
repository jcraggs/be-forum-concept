const apiEndpoints = require("../endpoints.json");

exports.getAPIendpoints = (req, res, next) => {
  res.status(200).json(apiEndpoints);
};
