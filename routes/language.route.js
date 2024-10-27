const express = require("express");
const Joi = require("joi");

const { languageController } = require("../controllers");
const { auth, validate } = require("../middlewares");

const router = express.Router();
Joi.objectId = require("joi-objectid")(Joi);

router.post(
  "/",
  auth.verifyToken,
  validate({
    body: Joi.object({
      name: Joi.string().required(),
    }),
  }),
  async function (req, res, next) {
    try {
      const languages = await languageController.createLanguage(req.body);

      res
        .status(200)
        .json({ message: "Language created successfully", data: languages });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", auth.verifyToken, async function (req, res, next) {
  try {
    const languages = await languageController.getLanguages();

    res
      .status(200)
      .json({ message: "Languages fetched successfully", data: languages });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
