const connection = require("../db/connection.js");

const fetchTopics = () => {
  return connection.select("*").from("topics");
};

module.exports = { fetchTopics };
