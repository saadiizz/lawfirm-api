const express = require("express");
const Joi = require("joi");

const { authController } = require("../controllers");
const { auth, validate } = require("../middlewares");
const { USER_Type, VERIFY_CODE_SOURCE } = require("../constants");

const router = express.Router();
Joi.objectId = require("joi-objectid")(Joi);

router.post(
  "/register",
  validate({
    body: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      phone: Joi.string().required(),
      userType: Joi.string()
        .required()
        .valid(USER_Type.INDIVIDUAL, USER_Type.BUSINESS, USER_Type.PROVIDER),
      workInfo: Joi.array().optional(),
    }),
  }),
  async function (req, res, next) {
    try {
      const user = await authController.register(req.body);

      res.status(200).json({
        message: "User registered successfully!",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  validate({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  async function (req, res, next) {
    try {
      const user = await authController.login(req.body);

      res.status(200).json({
        message: "You are logged in successfully!",
        data: {
          user,
          accessToken: user.isEmailVerified
            ? auth.createToken({ _id: user._id })
            : undefined,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/send-email-code",
  validate({
    body: Joi.object({
      email: Joi.string().email().required(),
      source: Joi.string()
        .required()
        .valid(VERIFY_CODE_SOURCE.EMAIL_VERIFICATION),
    }),
  }),
  async function (req, res, next) {
    try {
      await authController.sendEmailCode(req.body);

      res.status(200).json({
        message: "Token generated successfully!",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/verify-email-code",
  validate({
    body: Joi.object({
      email: Joi.string().email().required(),
      source: Joi.string()
        .required()
        .valid(VERIFY_CODE_SOURCE.EMAIL_VERIFICATION),
      verificationToken: Joi.number().required(),
    }),
  }),
  async function (req, res, next) {
    try {
      const data = await authController.verifyEmailCode(req.body);

      res.status(200).json({
        message: "Token verified successfully!",
        data: { data },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/update-password",
  auth.verifyToken,
  validate({
    body: Joi.object({
      password: Joi.string().required(),
    }),
  }),
  async function (req, res, next) {
    try {
      await authController.updatePassword(req.body, req.user);

      res
        .status(200)
        .json({ message: "Password updated successfully.", data: {} });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
