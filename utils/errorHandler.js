exports.handleCustomErrors = (err, req, res, next) => {
  console.log("in custom errors");
  console.log(err);
  res.status(err.status).send({ msg: err.msg });
};
exports.routeDoesNotExist = (req, res, next) => {
  console.log("in route does not exist");
  res.status(404).send({ msg: "Error: Page not found" });
};
exports.methodNotAllowed = (req, res, next) => {
  console.log("in method not allowed");
  res.status(405).send({ msg: "Method not allowed" });
};
exports.handlePSQLErrors = (err, req, res, next) => {
  console.log("in PSQL errors");
  console.log(err);
};
exports.handleServerErrors = (err, req, res, next) => {
  console.log("in server errors");
  console.log(err);
};
