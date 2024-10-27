const winston = require("winston");
const mongoose = require("mongoose");
const { MONGODB_URL } = process.env;

module.exports = function () {
  mongoose
    .connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => winston.info("Connected to MongoDB..."))
    .catch((err) => winston.error(err));
};
