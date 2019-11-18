const express = require("express");
const app = express();
const cors = require("cors");
const apiRouter = require("./routes/api-router");
const {
  handleCustomErrors,
  routeDoesNotExist,
  methodNotAllowed,
  handlePSQLErrors,
  handleServerErrors
} = require("./utils/errorHandler");

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

app.use(handleCustomErrors);
app.use(routeDoesNotExist);
app.use(methodNotAllowed);
app.use(handlePSQLErrors);
app.use(handleServerErrors);

module.exports = app;
