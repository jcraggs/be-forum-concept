process.env.NODE_ENV = "test";
const { expect } = require("chai");
const request = require("supertest");
const app = require("../app.js");

const connection = require("../db/connection.js");

describe("/api", () => {
  after(() => {
    connection.destroy();
  });
  beforeEach(() => {
    return connection.seed.run();
  });
  describe("/topics", () => {
    it("GET returns status 200 & all topics data", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body: { topics } }) => {
          expect(topics).to.be.an("array");
          expect(topics[0]).to.have.keys("slug", "description");
        });
    });
  });
  describe("/not-a-route", () => {
    it("GET returns status 404 when get request on an invalid url route is attempted", () => {
      return request(app)
        .get("/api/not-a-route")
        .expect(404)
        .then(response => {
          expect(response.body).to.eql({
            msg: "Error: Page not found"
          });
        });
    });
  });
  describe("/users/:username", () => {
    it("GET returns status 200 and the user data", () => {
      return request(app)
        .get("/api/users/icellusedkars")
        .expect(200)
        .expect(({ body: { user } }) => {
          expect(user).to.be.an("object");
          expect(user).to.have.keys("username", "avatar_url", "name");
        });
    });
    describe("Errors", () => {
      it("GET returns status 404 and message explaining that the username does not exist", () => {
        return request(app)
          .get("/api/users/not-a-valid-username")
          .expect(404)
          .then(response => {
            expect(response.body).to.eql({
              msg: "Error: username does not exist"
            });
          });
      });
      it("DELETE/POST/PATCH method on the /api/users/:username endpoint returns status 405 and a message saying method not allowed", () => {
        const methods = ["delete", "post", "patch"];
        const invalidMethods = methods.map(item => {
          return request(app)
            [item]("/api/users/icellusedkars")
            .expect(405)
            .then(response => {
              expect(response.body).to.eql({
                msg: "Method not allowed"
              });
            });
        });
        return Promise.all(invalidMethods);
      });
    });
  });
  describe("/articles/:article_id", () => {
    it("GET returns status 200 and the specified article data", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .expect(({ body: { article } }) => {
          expect(article).to.be.an("object");
          expect(article).to.have.keys(
            "article_id",
            "title",
            "body",
            "votes",
            "topic",
            "author",
            "created_at",
            "comment_count"
          );
        });
    });
    it("PATCH returns status 200 and the item with the updated vote count", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: 1234 })
        .expect(200)
        .then(response => {
          expect(response.body).to.be.an("object");
          expect(response.body).to.have.keys(
            "article_id",
            "title",
            "body",
            "votes",
            "topic",
            "author",
            "created_at"
          );
          expect(response.body.votes).to.equal(1334);
        });
    });
    describe("Errors", () => {
      it("GET returns status 404 and message explaining that the article_id does not exist", () => {
        return request(app)
          .get("/api/articles/9999999")
          .expect(404)
          .then(response => {
            expect(response.body).to.eql({
              msg: "Error: article does not exist"
            });
          });
      });
      it("GET returns status 400 and with acompanying message explaining the incorrect syntax input", () => {
        return request(app)
          .get("/api/articles/invalid-id")
          .expect(400)
          .then(response => {
            expect(response.body).to.eql({
              msg: 'invalid input syntax for integer: "invalid-id"'
            });
          });
      });
      it("DELETE method on an article endpoint returns status 405 and a message saying method not allowed", () => {
        return request(app)
          .delete("/api/articles/1")
          .expect(405)
          .then(response => {
            expect(response.body).to.eql({ msg: "Method not allowed" });
          });
      });
      it("PATCH method on an article with invalid send object value returns status 400 and a message saying that input syntax for patch key should be a number ", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: "not a number" })
          .expect(400)
          .then(response => {
            expect(response.body).to.eql({
              msg:
                "Error: update value input for votes patch method should be an integer"
            });
          });
      });
      it("PATCH method on an article with invalid send object key returns status 400 and a message saying that the update key is invalid", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({ badKey: 1 })
          .expect(400)
          .then(response => {
            expect(response.body).to.eql({
              msg: `Error: the sent patch key "badKey" is invalid. The input for the send patch request on the "/api/articles/:article_id" end point is limited to changing vote counts and therefore must be formatted as follows: { 'inc_votes': [integer] }`
            });
          });
      });
      it("PATCH method on an article which doesn't exist returns status 404 and a message saying patched failed- article does not exist", () => {
        return request(app)
          .patch("/api/articles/9999999")
          .send({ inc_votes: 123 })
          .expect(404)
          .then(response => {
            expect(response.body).to.eql({
              msg: "Error: patch failed, article does not exist"
            });
          });
      });
      it("PATCH method with a bad url input where article_id should be returns status 400 and a message explaining the bad request", () => {
        return request(app)
          .patch("/api/articles/invalid-article-id")
          .send({ inc_votes: 123 })
          .expect(400)
          .then(response => {
            expect(response.body).to.eql({
              msg: 'invalid input syntax for integer: "invalid-article-id"'
            });
          });
      });
    });
    describe.only("/articles/:article_id/comments", () => {
      it("POST returns status 201 and the item which has been posted", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .send({ username: "butter_bridge", body: "posting a test comment" })
          .expect(201)
          .then(response => {
            expect(response.body).to.have.keys([
              "comment_id",
              "author",
              "article_id",
              "votes",
              "created_at",
              "body"
            ]);
            expect(response.body.author).to.eql("butter_bridge");
            expect(response.body.votes).to.eql(0);
            expect(response.body.article_id).to.eql(1);
            expect(response.body.body).to.eql("posting a test comment");
          });
      });
      describe("Errors", () => {
        it("POST returns 400 when either post send keys are invalid", () => {
          return request(app)
            .post("/api/articles/1/comments")
            .send({
              username: "butter_bridge",
              badBodyKey: "posting a test comment"
            })
            .expect(400)
            .then(response => {
              expect(response.body).to.eql({
                msg:
                  "Error: post:send request syntax invalid. Format should be { username: [author], body:[comment text] }"
              });
            });
        });
        it("POST returns generated psql error message when trying to post with a username that does not exist in the data-base", () => {
          return request(app)
            .post("/api/articles/1/comments")
            .send({ username: "not-a-valid-username", body: "test comment" })
            .expect(400)
            .then(response => {
              expect(response.body).to.eql({
                msg:
                  'Key (author)=(not-a-valid-username) is not present in table "users". [Violates foreign key constraint]'
              });
            });
        });
        it("POST returns 400 and an error message saying the post:send request syntax invalid when attempting to send more than the username and body keys", () => {
          request(app)
            .post("/api/articles/1/comments")
            .send({
              username: "butter_bridge",
              body: "posting a test comment",
              extraKey: "this should not be here"
            })
            .expect(400)
            .then(response => {
              expect(response.body).to.eql({
                msg:
                  "Error: post:send request syntax invalid. Format should be { username: [author], body:[comment text] }"
              });
            });
        });
        it("POST returns 400 and a psql error message when article_id is not present in the database", () => {
          request(app)
            .post("/api/articles/999999/comments")
            .send({
              username: "butter_bridge",
              body: "posting a test comment"
            })
            .expect(400)
            .then(response => {
              expect(response.body).to.eql({
                msg:
                  'Key (article_id)=(999999) is not present in table "articles". [Violates foreign key constraint]'
              });
            });
        });
        it("POST returns 400 and a psql error message when article_id parametric endpoint input is not an integer", () => {
          request(app)
            .post("/api/articles/not-a-valid-article_id/comments")
            .send({
              username: "butter_bridge",
              body: "posting a test comment"
            })
            .expect(400)
            .then(response => {
              expect(response.body).to.eql({
                msg:
                  'invalid input syntax for integer: "not-a-valid-article_id"'
              });
            });
        });
        it("PATCH/DELETE method on a the /api/articles/:article_id/comments endpoint returns status 405 and a message saying method not allowed", () => {
          const methods = ["delete", "patch"];
          const invalidMethods = methods.map(item => {
            return request(app)
              [item]("/api/articles/1/comments")
              .expect(405)
              .then(response => {
                expect(response.body).to.eql({
                  msg: "Method not allowed"
                });
              });
          });
          return Promise.all(invalidMethods);
        });
      });
    });
  });
});
