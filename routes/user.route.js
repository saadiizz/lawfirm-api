const express = require("express");
const Joi = require("joi");

const { userController } = require("../controllers");

const { auth, validate } = require("../middlewares");
const {
  DESIGNATION_TYPE,
  BILLING_STRUCTURE,
  REPRESENT_TYPE,
  SUBSCRIPTION_PACKAGES,
} = require("../constants");

const router = express.Router();
Joi.objectId = require("joi-objectid")(Joi);

router.get("/me", auth.verifyToken, async function (req, res, next) {
  try {
    const currentUser = await userController.getCurrentUser(req.user);

    res
      .status(200)
      .json({ message: "User fetched successfully", data: currentUser });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/my-searches",
  auth.verifyToken,
  validate({
    body: Joi.object({
      filters: Joi.object(),
    }),
    query: Joi.object({
      page: Joi.number(),
      limit: Joi.number(),
    }),
  }),
  async function (req, res, next) {
    try {
      const { totalRecords, mySearches } = await userController.getUserSearches(
        req.body,
        req.query,
        req.user
      );

      res
        .status(200)
        .json({ message: "OK_MESSAGE", data: { totalRecords, mySearches } });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:userId",
  auth.verifyToken,
  validate({
    params: Joi.object({
      userId: Joi.objectId(),
    }),
  }),
  async function (req, res, next) {
    try {
      const currentUser = await userController.getProvider(
        req.params,
        req.user
      );

      res
        .status(200)
        .json({ message: "Profile fetched successfully", data: currentUser });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/",
  auth.verifyToken,
  validate({
    body: Joi.object({
      designation: Joi.string().valid(
        DESIGNATION_TYPE.ASSOCIATE,
        DESIGNATION_TYPE.OF_COUNSEL,
        DESIGNATION_TYPE.OTHER,
        DESIGNATION_TYPE.PARTNER,
        DESIGNATION_TYPE.SOLO_PRACTITIONER
      ),
      profilePicture: Joi.string(),
      roleAtCompany: Joi.string(),
      stepsCompleted: Joi.number(),
      firmName: Joi.string(),
      firmWebsite: Joi.string(),
      billingStructure: Joi.array().valid(
        BILLING_STRUCTURE.FIXED_FEE,
        BILLING_STRUCTURE.ON_CONTINGENCY,
        BILLING_STRUCTURE.PER_HOUR
      ),
      ratePerHourMin: Joi.number(),
      ratePerHourMax: Joi.number(),
      onContingency: Joi.number(),
      represent: Joi.array().valid(
        REPRESENT_TYPE.COMPANIES,
        REPRESENT_TYPE.INDIVIDUAL
      ),
      practiceAreas: Joi.array(),
      practicingLawSince: Joi.date(),
      licenses: Joi.array(),
      locationPermitted: Joi.array(),
      biography: Joi.string(),
      languages: Joi.array(),
      socialURLs: Joi.array(),
      educations: Joi.array(),
      publications: Joi.array(),
      awards: Joi.array(),
      associations: Joi.array(),
      experiences: Joi.array(),
      businesses: Joi.array(),
      addresses: Joi.array(),
      subscription: Joi.string().valid(
        SUBSCRIPTION_PACKAGES.PREMIUM,
        SUBSCRIPTION_PACKAGES.STANDARD
      ),
    }),
  }),
  async function (req, res, next) {
    try {
      const user = await userController.updateUserProfile(req.body, req.user);

      res
        .status(200)
        .json({ message: "Profile updated successfully!", data: user });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
