# Forum-Concept Application

## Project summary

A back-end project comprising of a RESTful API for a mock news/reddit-style forum.

The back-end built allows the user to build their database using knex migrations, seed the tables with existing data files utilising knex's in-built seed features and interact with the database using knex in a promise-based, MVC structured server comprising multiple endpoints. These endpoints have been created using TDD, with sufficient error handling, to allow predictable API functionality.

The current project contains a test and a development database, with the former used for testing purposes and the development data pushed into production using Heroku. See the [hosting.md](https://github.com/jcraggs/nc-news/blob/master/hosting.md) file for how this app has been deployed on Heroku.

The built API is hosted here: https://forum-concept.herokuapp.com/api

## Getting Started

These instructions will allow you to get a copy of the project up and running on your local machine for your own development and testing purposes.

It is assumed that the following packages are already globally installed:

| Package | Version |
| ------- | ------- |
| Node.JS | 8.10.0  |
| NPM     | 6.12.0  |

The following dependencies exist for running the application:

| Dependency  | Summary                                                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Express     | Express is a minimal and flexible Node.js application framework that provides a robust set of features for web applications.                                            |
| Knex        | Knex is a SQL query builder for Postgres (and others) designed to be easy to use and provides the ideal conduit between JavaScript & SQL.                               |
| PostgreSQL  | PostgreSQL is a powerful, open source object-relational database system                                                                                                 |
| Chai        | Chai is a TDD assertion library for node that can be paired well with Mocha for extensive testing of code.                                                              |
| Chai-Sorted | an extension of Chai that allows for testing whether arrays of objects have been sorted in a specified order.                                                           |
| Mocha       | Mocha is a testing framework that provides functions that are executed according in a specific order, and that logs their results to the terminal window.               |
| Supertest   | Supertest is a library made specifically for testing node.js http servers and allows us to make client requests to our server, testing the responses with Mocha & Chai. |

All of the above can be installed by using the following command in your CLI.

```
npm install
```

You will need to create a 'knexfile.js' to allow local deployment and testing, as this has been included in the .gitignore. Information on the contents of this knex file can be found in the the [hosting.md](https://github.com/jcraggs/nc-news/blob/master/hosting.md) file.

Once dependencies are installed and the knexfile has been created the following scripts also need to be run to set up and seed the databases:

1. Initialises database:

```
npm run setup-dbs
```

2. Seeds database:

```
npm run seed
```

It is worth noting that changes also need to be pushed to heroku as well as github. This can be done using the following command:

```
git push heroku master
```

## Project File Structure

The file descriptions and structure of this project is provided below:

```raw
.
├── controllers
│   └── c-api/articles/comments/topics/users .js files -> forwards HTTP requests to the relevant model and then passes the response back to the client
│
├── db
│   ├── data
│   │   ├── index.js -> exports 'development' and 'test' data depending on the process.ENV specified (test, development or production)
│   │   ├── development-data
│   │   │   ├── index.js -> exports the raw array-object data
│   │   │   └──  articles/comments/topics/users .js files -> contains various arrays of objects containing the raw data
│   │   │
│   │   └── test-data
│   │       ├── index.js -> exports the raw array-object data
│   │       └── articles/comments/topics/users .js files -> contains various arrays of objects containing the raw data
│   │
│   ├── migrations
│   │   └── [datestamp]_topics/user/article/comment-table .js files -> this is where the schema for each table in the database is set up
│   │
│   ├── seeds
│   │   └── seed.js -> inserts the data into the tables set up by the migration file schema
│   │
│   ├── utils
│   │   └── utils.js -> contains the utility functions "formatDates, makeRefObj and formatComments" which modify the raw data to enable correct seeding
│   │
│   ├── connection.js -> allows communcation between the model and the database
│   └── setup.sql -> creates the database & tables depending on the process.ENV specified
│
├── models
│   └── m-articles/comments/topics/users .js files -> files which directly manage the data, logic and rules of the incoming API requests
│
├── node_modules -> folder containing all the npm node modules installed locally (this is gitignored)
│
├── routes
│   └── api/articles/comments/topics/users-router.js files -> specifies the built endpoints and HTTP methods allowed
│
├── spec
│   ├── app.spec.js -> TDD specification file which checks all the API endpoints for functionality and error responses
│   └── utils.spec.js -> TDD specification file to test the utility functions which modify the raw data prior to seeding
│
├── utils
│   └── errorHandler.js -> contains the middleware functions which send the user error messages depending on the HTTPS method that has been done incorrectly
│
├── .gitignore -> contains the local files to be ignored e.g. node_modules and knexfile.js
├── app.js -> the main configuration file for the express app
├── endpoints.json -> JSON file containing the information about the avaliable API endpoints
├── hosting.md -> markdown document explaining how the app is hosted
├── knexfile.js -> contains configuration information for knex (this is gitignored)
├── listen.js -> to allow the back-end to listen for incoming requests from the client side
├── package.json -> contains the metadata of the npm dependencies and scripts of the project
├── package-lock.json -> auto-generated file which stores an exact version dependency tree
└── README.md -> markdown document containing all the project information
```

## Current end-points

| Endpoint                           | Request | Response                                                                                                                          |
| ---------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| /api                               | GET     | Serves up a JSON representation of all the available endpoints of the API.                                                        |
| /api/topics                        | GET     | Serves an array of all the topics in the database.                                                                                |
| /api/users/:username               | GET     | Serves an object with the specified users' information.                                                                           |
| /api/articles                      | GET     | Serves an array of all the articles in the database.                                                                              |
| /api/articles/:article_id          | GET     | Serves an article object depending on the specified article_id.                                                                   |
| /api/articles/:article_id          | PATCH   | Serves an induvidual article object (based on article_id) with the 'votes' key changed by the value specified in the request body |
| /api/articles/:article_id/comments | GET     | Serves an array of all the avaliable comments for the given article_id.                                                           |
| /api/articles/:article_id/comments | POST    | Serves a single comment object with contents dependent on the post request body sent.                                             |
| /api/comments/:comment_id          | PATCH   | Serves an updated comment object with the 'votes' key changed by the value specified in the request body.                         |
| /api/comments/:comment_id          | DELETE  | Deletes the specified comment (based on comment_id) and returns an object with no content                                         |

## Test Driven Development (TDD)

The API has been developed using extensive testing. A script has been added to the package.json so that all tests can be ran by running the following in your CLI:

```
npm run test-utils
```

Runs the tests on the utility functions which condition the data prior to seeding.

```
npm run test-app
```

Runs the tests on all of the aforementioned endpoints.

## Built with

- Express.js - Back-end Framework
- Knex.js - Query builder for SQL based databases
- postgreSQL - Object-relational database management system
- Testing:
  - Mocha
  - Chai
  - Supertest
