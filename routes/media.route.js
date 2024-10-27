const express = require("express");
const Joi = require("joi");
const multer = require("multer");

const { mediaController } = require("../controllers");
const { auth, validate } = require("../middlewares");

const router = express.Router();
Joi.objectId = require("joi-objectid")(Joi);

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });
router.post(
  "/",
  upload.single("image"),
  //   auth.verifyToken,
  //   validate({
  //     body: Joi.object({
  //       name: Joi.string().required(),
  //       code: Joi.string().required(),
  //     }),
  //   }),
  async function (req, res, next) {
    try {
      const { _id: mediaId } = await mediaController.getNewMedia({});

      const myFile = req.file;

      const imageUrl = await mediaController.uploadMedia(
        myFile,
        `media/${mediaId}`
      );

      res.status(200).json({
        message: "Upload was successful",
        data: imageUrl,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", auth.verifyToken, async function (req, res, next) {
  try {
    const languages = await stateController.getStates();

    res.status(200).json(languages);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
