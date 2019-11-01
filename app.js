const express = require("express");
const app = express();
const apiRouter = require("./routes/api-router");
const {
  handleCustomErrors,
  routeDoesNotExist,
  methodNotAllowed,
  handlePSQLErrors,
  handleServerErrors
} = require("./utils/errorHandler");

app.use(express.json());

app.use("/api", apiRouter);

app.use(handleCustomErrors);
app.use(routeDoesNotExist);
app.use(methodNotAllowed);
app.use(handlePSQLErrors);
app.use(handleServerErrors);

module.exports = app;
