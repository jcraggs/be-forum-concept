exports.handleCustomErrors = (err, req, res, next) => {
  if (!err.code) {
    console.log("in custom errors");
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
  //console.log(err.code);
  //res.status(err.status).send({ msg: err.msg });
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
  if (err.code) {
    console.log("in PSQL errors");
    const createMessage = err => {
      return err.message.split(" - ")[1];
    };

    const psqlCodes = {
      "22P02": {
        status: 400,
        msg: createMessage(err)
      }
    };

    res
      .status(psqlCodes[err.code].status)
      .send({ msg: psqlCodes[err.code].msg });
  } else next(err);
};
exports.handleServerErrors = (err, req, res, next) => {
  console.log("in server errors");
  console.log(err);
};
