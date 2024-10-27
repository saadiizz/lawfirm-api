const express = require("express");
const Joi = require("joi");

const { searchController } = require("../controllers");
const { auth, validate } = require("../middlewares");

const router = express.Router();
Joi.objectId = require("joi-objectid")(Joi);

router.get(
  "/",
  auth.verifyToken,
  validate({
    query: Joi.object({
      searchId: Joi.objectId(),
      text: Joi.string(),
      page: Joi.number(),
      limit: Joi.number(),
    }),
  }),
  async function (req, res, next) {
    try {
      const data = await searchController.smartSearch(req.query, req.user);

      res.status(200).json({ message: "Profiles fetched successfully!", data });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
