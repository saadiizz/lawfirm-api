const winston = require("winston");
const helmet = require("helmet");
const compression = require("compression");
const curlExpress = require("express-curl");
const morgan = require("morgan");

const { JWT_PRIVATE_KEY, NODE_ENV, MONGODB_URL } = process.env;

module.exports = function (app) {
  if (!JWT_PRIVATE_KEY) {
    winston.error("FATAL ERROR: JWT_PRIVATE_KEY is not defined!");
    process.exit(1);
  }
  if (!MONGODB_URL) {
    winston.error("FATAL ERROR: MONGODB_URL is not defined!");
    process.exit(1);
  }

  switch (NODE_ENV) {
    case "production":
      app.use(helmet());
      app.use(compression());
      app.use(curlExpress);
      break;

    default:
      app.use(morgan("tiny"));
      break;
  }
};
