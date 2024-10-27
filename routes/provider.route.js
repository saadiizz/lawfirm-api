const express = require("express");
const Joi = require("joi");

const { userController } = require("../controllers");
const { auth, validate } = require("../middlewares");

const router = express.Router();
Joi.objectId = require("joi-objectid")(Joi);

router.post(
  "/get-stats",
  auth.verifyToken,
  validate({
    body: Joi.object({
      filters: Joi.object(),
    }),
  }),
  async function (req, res, next) {
    try {
      const stats = await userController.getProviderStats(req.body, req.user);

      res
        .status(200)
        .json({ message: "Lawyers stats fetched successfully", data: stats });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
