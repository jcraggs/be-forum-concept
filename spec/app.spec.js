process.env.NODE_ENV = "test";
const { expect } = require("chai");
const chai = require("chai");
chai.use(require("chai-sorted"));
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
  describe.only("/articles", () => {
    it("GET returns status 200 and an array of article objects", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).to.be.an("array");
          expect(articles[0]).to.have.keys(
            "article_id",
            "author",
            "title",
            "topic",
            "created_at",
            "votes",
            "comment_count"
          );
        });
    });
    it("GET query 'sort_by=article_id' returns status 200 and an array of the articles sorted by article_id", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).to.be.descendingBy("article_id");
        });
    });
    it("GET query 'order=asc' returns status 200 and an array of the articles ordered in ascending, defaulting to created at", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).to.be.ascendingBy("created_at");
        });
    });
    it("GET query 'order=asc' returns status 200 and an array of the articles ordered in ascending, defaulting to created at", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).to.be.ascendingBy("article_id");
        });
    });
    it("GET query 'author' returns status 200 and an array of the articles by that author", () => {
      return request(app)
        .get("/api/articles?author=butter_bridge")
        .expect(200)
        .then(({ body: { articles } }) => {
          articles.forEach(item => {
            expect(item.author).to.eql("butter_bridge");
          });
        });
    });
    it("GET query 'topic' returns status 200 and an array of the articles which match the topic", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body: { articles } }) => {
          articles.forEach(item => {
            expect(item.topic).to.eql("mitch");
          });
        });
    });
    it("GET query 'topic & author' returns status 200 and an array of the articles which match the topic", () => {
      return request(app)
        .get(
          "/api/articles?topic=mitch&author=butter_bridge&sort_by=article_id&order=asc"
        )
        .expect(200)
        .then(({ body: { articles } }) => {
          articles.forEach(item => {
            expect(item.topic).to.eql("mitch");
            expect(item.author).to.eql("butter_bridge");
          });
          expect(articles).to.be.ascendingBy("article_id");
        });
    });
    describe("Errors", () => {
      it("PATCH/DELETE/POST methods on a the /api/articles endpoint returns status 405 and a message saying method not allowed", () => {
        const methods = ["delete", "patch", "post"];
        const invalidMethods = methods.map(item => {
          return request(app)
            [item]("/api/articles")
            .expect(405)
            .then(response => {
              expect(response.body).to.eql({
                msg: "Method not allowed"
              });
            });
        });
        return Promise.all(invalidMethods);
      });
      it("GET query with bad sort_by input returns 404 and a message explaining the input does not match column data ", () => {
        return request(app)
          .get("/api/articles?sort_by=not-a-valid-column")
          .expect(404)
          .then(response => {
            expect(response.body).to.eql({
              msg:
                'Error: sort_by query syntax "not-a-valid-column" does not match any column data avaliable'
            });
          });
      });
      it("GET query with an invalid order input returns 400 and a message explaining the input is not a valid column ", () => {
        return request(app)
          .get("/api/articles?order=not-desc-or-asc")
          .expect(400)
          .then(response => {
            expect(response.body).to.eql({
              msg:
                'Error: order query syntax "not-desc-or-asc" is not valid. Order query input must be either "asc", "desc" or left undefined'
            });
          });
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
    describe("/articles/:article_id/comments", () => {
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
      it("GET returns status 200 and an array of comments for the given article_id", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then(response => {
            expect(response.body).to.be.an("array");
            response.body.forEach(item => {
              expect(item).to.have.keys(
                "comment_id",
                "votes",
                "created_at",
                "author",
                "body"
              );
            });
          });
      });
      it("GET returns status 200 and an empty array when given a valid article_id which has no comments", () => {
        return request(app)
          .get("/api/articles/2/comments")
          .expect(200)
          .then(response => {
            expect(response.body).to.eql([]);
          });
      });
      it("GET query 'sort_by=votes' returns status 200 and an array of the comments sorted by votes", () => {
        return request(app)
          .get("/api/articles/1/comments?sort_by=votes")
          .expect(200)
          .then(response => {
            expect(response.body).to.be.descendingBy("votes");
          });
      });
      it("GET query with no 'sort_by or order' specified returns status 200 and an array of the comments sorted by 'created_at' in descending (the default)", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then(response => {
            expect(response.body).to.be.descendingBy("created_at");
          });
      });
      it("GET query with 'order' specified as ascending returns status 200 and an array of the comments sorted by created_at (the default) in ascending order", () => {
        return request(app)
          .get("/api/articles/1/comments/?order=asc")
          .expect(200)
          .then(response => {
            expect(response.body).to.be.ascendingBy("created_at");
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
        it("GET returns 404 and message explaining that the article_id (and therefore comments) requested does not exist", () => {
          return request(app)
            .get("/api/articles/999/comments")
            .expect(404)
            .then(response => {
              expect(response.body).to.eql({
                msg: 'Error: article "999" does not exist'
              });
            });
        });
        it("GET returns 400 and a psql error message explaining the invalid input syntax for integer", () => {
          return request(app)
            .get("/api/articles/not-a-valid-article/comments")
            .expect(400)
            .then(response => {
              expect(response.body).to.eql({
                msg: 'invalid input syntax for integer: "not-a-valid-article"'
              });
            });
        });
        it("GET with bad order query returns status 400 and message explaining the input is constrained to asc, desc or undefined", () => {
          return request(app)
            .get("/api/articles/1/comments?order=not-desc-or-asc")
            .expect(400)
            .then(response => {
              expect(response.body).to.eql({
                msg:
                  'Error: order query syntax "not-desc-or-asc" is not valid. Order query input must be either "asc", "desc" or left undefined'
              });
            });
        });
        it("GET with bad sort_by query returns 404 and a message explaining the input is not a valid column", () => {
          return request(app)
            .get("/api/articles/1/comments?sort_by=not-a-valid-column")
            .expect(404)
            .then(response => {
              expect(response.body).to.eql({
                msg:
                  'Error: sort_by query syntax "not-a-valid-column" does not match any column data avaliable'
              });
            });
        });
      });
    });
  });
});
