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
          console.log(response.body);
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
      it("DELETE/POST/PATCH method on a username endpoint returns status 405 and a message saying method not allowed", () => {
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
          console.log(response.body);
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
    });
  });
});
