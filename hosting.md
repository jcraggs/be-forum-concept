# Hosting a PSQL DB using Heroku

There are many ways to host applications like the one created here. One of these solutions is Heroku. Heroku provides a service that you can push your code to and it will build, run and host it. Heroku also allows for easy database integration. The Heroku [documentation](https://devcenter.heroku.com/articles/getting-started-with-nodejs) is excellent, so take a look at that. This document is a condensed version of the steps described in the Heroku docs.

## 1. Install the Heroku CLI

On macOS:

```bash
brew tap heroku/brew && brew install heroku
```

On Ubuntu:

```bash
sudo snap install --classic heroku
```

## 2. Create a Heroku App

Log into Heroku using their command line interface:

```bash
heroku login
```

Create an app in an active git directory. Doing this in the folder where your server exists is a good start, as this is what you will be hosting.

```bash
heroku create your-app-name
```

Here `your-app-name` should be the name you want to give your application. If you don't specify an app name, you'll get a random one.

This command will both create an app on Heroku for your account. It will also add a new `remote` to your git repository.
Check this by looking at your git remotes:

```bash
git remote -v
```

## 3. Push Your code up to Heroku

```bash
git push heroku master
```

## 4. Creating a Hosted Database

Go to the heroku site and log in.

- Select your application
- `Configure Add-ons`
- Choose `Heroku Postgres`

This will provide you with a `postgreSQL` pre-created database.
FYI the free tier offered by Heroku will be adequate for most simple purposes e.g. a static concept app such as this.

Check that the database exists. Click `settings` on it, and view the credentials. Keep an eye on the URI. Don't close this yet!

## 5. Seeding the Production Database

Check that the database exists. Click on the new installed `Heroku Postgres` add-on and then click `settings` on it, and view the credentials.
Check that your database's url is added to the environment variables on Heroku:

```bash
heroku config:get DATABASE_URL
```

If you are in your app's directory, and the database is correctly linked as an add on to Heroku, it should display a DB URI string that is exactly the same as the one in your credentials.

Make sure that your `knexfile.js`, looks like this (with the username and password inputs dependent on your psql):

```js
const { DB_URL } = process.env;
const ENV = process.env.NODE_ENV || "development";

const baseConfig = {
  client: "pg",
  migrations: {
    directory: "./db/migrations"
  },
  seeds: {
    directory: "./db/seeds"
  }
};
const customConfig = {
  development: {
    connection: {
      database: "nc_news",
      username:
        "[Linux users put psql username here. Mac users can ignore the username and password keys and values]",
      password:
        "[Linux users put psql password here. Mac users can ignore the username and password keys and values]"
    }
  },
  test: {
    connection: {
      database: "nc_news_test",
      username:
        "[Linux users put psql username here. Mac users can ignore the username and password keys and values]",
      password:
        "[Linux users put psql password here. Mac users can ignore the username and password keys and values]"
    }
  },
  production: {
    connection: `${DB_URL}?ssl=true`
  }
};

module.exports = { ...customConfig[ENV], ...baseConfig };

// ...
```

It is critical to add the query of `ssl=true`, onto the production connection, otherwise this will not work.

In your `./db/data/index.js` make sure there is a key of production with a value of your development data in your data object. Something like:

```js
const data = { test, development, production: development };
```

This is will ensure your production DB will get seeded with the development data.

In your `package.json`, make sure the following keys are present in the scripts:

```json
{
  "scripts": {
    "seed:prod": "NODE_ENV=production DB_URL=$(heroku config:get DATABASE_URL) knex seed:run",
    "migrate-latest:prod": "NODE_ENV=production DB_URL=$(heroku config:get DATABASE_URL) knex migrate:latest",
    "migrate-rollback:prod": "NODE_ENV=production DB_URL=$(heroku config:get DATABASE_URL) knex migrate:rollback"
  }
}
```

Each of these will establish an environment variable called `DB_URL`, and set it to whatever heroku provides as your DB URL. It is essential that you do this as the DB URL may change! This deals with a lack of predictability on heroku's end.

Make sure to **run the seed prod script** from your `package.json`:

```bash
npm run seed:prod
```

## 6. Connect To The Hosted Database when on Heroku

Make sure your connection file looks something like this:

```js
const ENV = process.env.NODE_ENV || "development";
const knex = require("knex");

const dbConfig =
  ENV === "production"
    ? { client: "pg", connection: process.env.DATABASE_URL }
    : require("../knexfile");

module.exports = knex(dbConfig);
```

It should check whether you're in production, and if you are, it should connect to the production database. Otherwise it will connect to the (`.gitignore`'d) knex file.

## 7. Use Heroku's PORT

In the `listen.js`, make sure that the PORT is taken off the environment object if it's provided, like so:

```js
const app = require("./app");

const { PORT = 9090 } = process.env;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
```

## 8. Add a start script

Make sure your package.json has this as a start script:

```json
"start": "node listen.js",
```

Commit any changes, and push to heroku master.

```bash
git push heroku master
```

## 9. Review Your App

```bash
heroku open
```

Any issues should be debugged with:

```bash
heroku logs --tail
```
