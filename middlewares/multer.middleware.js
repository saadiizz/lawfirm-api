const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).single("demo_image");

const catchFile = (err, req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(400).send("Something went wrong!");
    }
    req.myFile = req.file;
    next();
  });
};

module.exports = {
  catchFile,
};
