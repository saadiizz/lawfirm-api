const express = require("express");
const Joi = require("joi");

const { categoryController } = require("../controllers");
const { auth, validate } = require("../middlewares");

const router = express.Router();
Joi.objectId = require("joi-objectid")(Joi);

router.post(
  "/",
  auth.verifyToken,
  validate({
    body: Joi.object({
      name: Joi.string().required(),
      isIndividual: Joi.boolean().required(),
      isBusiness: Joi.boolean().required(),
      isLocationDependent: Joi.boolean().required(),
      states: Joi.array().required(),
    }),
  }),
  async function (req, res, next) {
    try {
      const category = await categoryController.createCategory(req.body);

      res
        .status(200)
        .json({ message: "Category created successfully", data: category });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", auth.verifyToken, async function (req, res, next) {
  try {
    const categories = await categoryController.getCategories(req.user);

    res
      .status(200)
      .json({ message: "Categories fetched successfully", data: categories });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:categoryId",
  auth.verifyToken,
  validate({
    params: Joi.object({
      categoryId: Joi.objectId().required(),
    }),
  }),
  async function (req, res, next) {
    try {
      const category = await categoryController.getCategoryById(req.params);

      res
        .status(200)
        .json({ message: "Category fetched successfully", data: category });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
