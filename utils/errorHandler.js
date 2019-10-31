exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.routeDoesNotExist = (req, res, next) => {
  res.status(404).send({ msg: "Error: Page not found" });
};

exports.methodNotAllowed = (req, res, next) => {
  res.status(405).send({ msg: "Method not allowed" });
};

exports.handlePSQLErrors = (err, req, res, next) => {
  const createMessage = err => {
    return err.message.split(" - ")[1];
  };
  const psqlCodes = {
    "22P02": {
      status: 400,
      msg: createMessage(err)
    },
    "23503": {
      status: 400,
      msg: err.detail + " [Violates foreign key constraint]"
    }
  };

  if (psqlCodes[err.code]) {
    res
      .status(psqlCodes[err.code].status)
      .send({ msg: psqlCodes[err.code].msg });
  } else next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "ERROR" });
};
