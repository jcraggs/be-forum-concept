const connection = require("../db/connection.js");

const fetchAllArticles = (sort_by, order, author, topic) => {
  const validSort_by = [
    "article_id",
    "author",
    "title",
    "topic",
    "created_at",
    "votes",
    "comment_count",
    undefined
  ];

  const validOrder = ["asc", "desc", undefined];

  if (!validSort_by.includes(sort_by)) {
    return Promise.reject({
      status: 404,
      msg: `Error: sort_by query syntax "${sort_by}" does not match any column data avaliable`
    });
  }

  if (!validOrder.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: `Error: order query syntax "${order}" is not valid. Order query input must be either "asc", "desc" or left undefined`
    });
  }

  const articlesPromise = connection
    .select(
      "articles.article_id",
      "articles.author",
      "articles.title",
      "articles.article_id",
      "articles.topic",
      "articles.created_at",
      "articles.votes"
    )
    .from("articles")
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .count("comment_id as comment_count")
    .groupBy("articles.article_id")
    .orderBy(sort_by || "created_at", order || "desc")
    .modify(query => {
      if (author) query.where("articles.author", author);
      if (topic) query.where("articles.topic", topic);
    })
    .returning("*")
    .then(response => {
      return response;
    });

  let authorFlag = true;

  if (author) {
    authorFlag = checkAuthorExists(author);
  }

  let topicFlag = true;

  if (topic) {
    topicFlag = checkTopicExists(topic);
  }

  return Promise.all([articlesPromise, authorFlag, topicFlag]).then(
    ([articles, authorFlag, topicFlag]) => {
      if (articles.length) return articles;

      if (articles.length === 0 && authorFlag && author) {
        return [];
      }

      if (articles.length === 0 && topicFlag && topic) {
        return [];
      }

      if (topic) {
        return Promise.reject({
          status: 404,
          msg: `Error: topic "${topic}" does not exist`
        });
      }

      if (author) {
        return Promise.reject({
          status: 404,
          msg: `Error: author "${author}" does not exist`
        });
      }
    }
  );
};

const fetchArticleById = inputArticle_id => {
  return connection
    .select("articles.*")
    .from("articles")
    .where({ "articles.article_id": inputArticle_id })
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .count("comment_id as comment_count")
    .groupBy("articles.article_id")
    .then(response => {
      if (!response[0]) {
        return Promise.reject({
          status: 404,
          msg: "Error: article does not exist"
        });
      } else return response[0];
    });
};

const updateArticleVotes = (update, inputArticle_id) => {
  if (isNaN(update.inc_votes) && update.inc_votes !== undefined) {
    return Promise.reject({
      status: 400,
      msg:
        "Error: update value input for votes patch method should be an integer"
    });
  }

  if (update.inc_votes === undefined) {
    updateKey = Object.keys(update);
    return Promise.reject({
      status: 400,
      msg: `Error: the sent patch key "${
        updateKey[0]
      }" is invalid. The input for the send patch request on the "/api/articles/:article_id" end point is limited to changing vote counts and therefore must be formatted as follows: { 'inc_votes': [integer] }`
    });
  }

  return connection
    .first()
    .from("articles")
    .where({ article_id: inputArticle_id })
    .increment("votes", update.inc_votes)
    .returning("*")
    .then(response => {
      if (!response[0]) {
        return Promise.reject({
          status: 404,
          msg: "Error: patch failed, article does not exist"
        });
      } else return response[0];
    });
};

const createComment = (inputComment, inputArticle_id) => {
  inputKeys = Object.keys(inputComment);
  if (!inputComment.username || !inputComment.body || inputKeys.length > 2) {
    return Promise.reject({
      status: 400,
      msg: `Error: post:send request syntax invalid. Format should be { username: [author], body:[comment text] }`
    });
  }
  let newComment = {
    author: inputComment.username,
    article_id: inputArticle_id,
    body: inputComment.body
  };

  return connection
    .insert(newComment)
    .into("comments")
    .returning("*")
    .then(response => {
      return response[0];
    });
};

const fetchComments = (inputArticle_id, sort_by, order) => {
  const acceptedOrder = ["asc", "desc", undefined];
  const acceptedSort_by = [
    undefined,
    "comment_id",
    "votes",
    "created_at",
    "author"
  ];

  if (!acceptedOrder.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: `Error: order query syntax "${order}" is not valid. Order query input must be either "asc", "desc" or left undefined`
    });
  }

  if (!acceptedSort_by.includes(sort_by)) {
    return Promise.reject({
      status: 404,
      msg: `Error: sort_by query syntax "${sort_by}" does not match any column data avaliable`
    });
  }

  const commentPromise = connection
    .select("comment_id", "votes", "created_at", "author", "body")
    .from("comments")
    .where({ article_id: inputArticle_id })
    .orderBy(sort_by || "created_at", order || "desc")
    .returning("*");

  const checkArticlePromise = checkArticleIdExists(inputArticle_id);

  return Promise.all([commentPromise, checkArticlePromise]).then(
    ([comments, articleFlag]) => {
      if (comments.length) return comments;
      if (comments.length === 0 && articleFlag === true) {
        return [];
      } else
        return Promise.reject({
          status: 404,
          msg: `Error: article "${inputArticle_id}" does not exist`
        });
    }
  );
};

const checkArticleIdExists = input => {
  return connection
    .select("*")
    .from("articles")
    .where({ article_id: input })
    .returning("*")
    .then(response => {
      if (response.length === 0) {
        return false;
      } else return true;
    });
};

const checkAuthorExists = input => {
  return connection
    .select("*")
    .from("users")
    .where({ username: input })
    .returning("*")
    .then(response => {
      if (response.length === 0) {
        return false;
      } else return true;
    });
};

const checkTopicExists = input => {
  return connection
    .select("*")
    .from("topics")
    .where({ slug: input })
    .returning("*")
    .then(response => {
      if (response.length === 0) {
        return false;
      } else return true;
    });
};

module.exports = {
  fetchArticleById,
  updateArticleVotes,
  createComment,
  fetchComments,
  fetchAllArticles
};
