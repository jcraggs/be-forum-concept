const connection = require("../db/connection.js");

const fetchUserByUsername = inputUsername => {
  return connection
    .first()
    .from("users")
    .where({ username: inputUsername })
    .returning("*")
    .then(response => {
      if (response === undefined) {
        return Promise.reject({
          status: 404,
          msg: "Error: username does not exist"
        });
      } else return response;
    });
};

module.exports = { fetchUserByUsername };
