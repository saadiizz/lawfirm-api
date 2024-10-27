const winston = require("winston"); //for loggin errors

module.exports = function (err, req, res, next) {
  winston.error(err.message, err);
  res.status(err.statusCode || 500).json({
    status: false,
    message: err.message || "Something went wrong!",
  });
};
