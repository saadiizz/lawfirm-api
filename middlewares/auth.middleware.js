const jwt = require("jsonwebtoken");
const sentry = require("@sentry/node");

const { User } = require("../models");

const { JWTKEY } = process.env;

const createToken = (data) => jwt.sign(data, JWTKEY);

const decodeToken = (token) => {
  return jwt.verify(token, JWTKEY);
};

const verifyToken = async (req, res, next) => {
  const authorization = req.headers["authorization"];

  if (!authorization) {
    return res.status(401).send("A token is required for authentication");
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    return res.status(401).send("A token is required for authentication");
  }

  try {
    const decoded = decodeToken(token);
    const { _id: userId } = decoded;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authenticated, profile not found!" });
    }

    sentry.setUser(user);

    req.user = user;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = { verifyToken, createToken, decodeToken };
