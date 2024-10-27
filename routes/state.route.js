const express = require("express");
const Joi = require("joi");

const { stateController } = require("../controllers");
const { auth, validate } = require("../middlewares");

const router = express.Router();
Joi.objectId = require("joi-objectid")(Joi);

router.post(
  "/",
  auth.verifyToken,
  validate({
    body: Joi.object({
      name: Joi.string().required(),
      code: Joi.string().required(),
    }),
  }),
  async function (req, res, next) {
    try {
      const state = await stateController.createState(req.body);

      res
        .status(200)
        .json({ message: "State created successfully", data: state });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", auth.verifyToken, async function (req, res, next) {
  try {
    const states = await stateController.getStates();

    res
      .status(200)
      .json({ message: "States fetched successfully", data: states });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
