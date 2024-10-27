const express = require("express");
const Joi = require("joi");
const { searchController } = require("../controllers");

const { auth, validate, admin } = require("../middlewares");

const router = express.Router();
Joi.objectId = require("joi-objectid")(Joi);

router.get(
  "/",
  auth.verifyToken,
  validate({
    query: Joi.object({
      searchId: Joi.objectId(),
      category: Joi.objectId(),
      state: Joi.objectId(),
      page: Joi.number(),
      limit: Joi.number(),
    }),
  }),
  async function (req, res, next) {
    try {
      const data = await searchController.searchByCategoryAndState(
        req.query,
        req.user
      );

      res.status(200).json({ message: "Profiles fetched successfully!", data });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:searchId/bookmark",
  auth.verifyToken,
  validate({
    params: Joi.object({
      searchId: Joi.objectId().required(),
    }),
    body: Joi.object({
      providerId: Joi.objectId().required(),
    }),
  }),
  async function (req, res, next) {
    try {
      const search = await searchController.addBookMark(
        req.params,
        req.body,
        req.user
      );

      res.status(200).json({ message: "Bookmarked successfully", data: search });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:searchId/bookmark",
    auth.verifyToken,
    validate({
      params: Joi.object({
        searchId: Joi.objectId().required(),
      }),
      body: Joi.object({
        providerId: Joi.objectId().required(),
      }),
    }),
  async function (req, res, next) {
    try {
      const deletedBookmarkedSearch = await searchController.deleteBookmark(
        req.body,
        req.params,
        req.user
      );

      res.status(200).json({ message: "Bookmarked removed successfully", data: deletedBookmarkedSearch });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:searchId",
  auth.verifyToken,
  validate({
    params: Joi.object({
      searchId: Joi.objectId(),
    }),
  }),
  async function (req, res, next) {
    try {
      const search = await searchController.getSearchById(req.params);

      res.status(200).json({ message: "OK_MESSAGE", data: search });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:searchId",
  auth.verifyToken,
  validate({
    params: Joi.object({
      searchId: Joi.objectId(),
    }),
  }),
  async function (req, res, next) {
    try {
      await searchController.deleteSearchById(req.params, req.user);

      res
        .status(200)
        .json({ message: "Search deleted succesfully.", data: {} });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
