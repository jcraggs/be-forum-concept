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

/*
You need the following, see README for what the endpoint should do
GET /api/topics -done

GET /api/users/:username - done + 404 and 405 errors built

GET /api/articles/:article_id - done + 404,400 and 405 errors built
PATCH /api/articles/:article_id - done with 404 and 3x 400 errors built

POST /api/articles/:article_id/comments
GET /api/articles/:article_id/comments

GET /api/articles

PATCH /api/comments/:comment_id
DELETE /api/comments/:comment_id

GET /api
*/

app.use(handleCustomErrors);
app.use(routeDoesNotExist);
app.use(methodNotAllowed);
app.use(handlePSQLErrors);
app.use(handleServerErrors);

module.exports = app;
