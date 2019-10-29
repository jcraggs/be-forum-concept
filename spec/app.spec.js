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
          expect(user).to.eql({
            username: "icellusedkars",
            avatar_url:
              "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
            name: "sam"
          });
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
            .expect(405);
        });
        return Promise.all(invalidMethods);
      });
    });
  });
});
