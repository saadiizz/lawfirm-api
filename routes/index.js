const express = require("express");

const { error } = require("../middlewares");

const router = express.Router();

router.use(function (req, res, next) {
  if (req.method == "OPTIONS") {
    return res.json();
  } else {
    next();
  }
});

// router.use("/", require("./base.routes"));
router.use("/auth", require("./auth.route"));
router.use("/business", require("./business.route"));
router.use("/categories", require("./category.route"));
router.use("/payments", require("./payment.route"));
router.use("/user", require("./user.route"));
router.use("/search", require("./search.route"));
router.use("/languages", require("./language.route"));
router.use("/states", require("./state.route"));
router.use("/media", require("./media.route"));
router.use("/provider", require("./provider.route"));
router.use("/text-search", require("./provider.route"));

// router.use(error);

module.exports = router;
