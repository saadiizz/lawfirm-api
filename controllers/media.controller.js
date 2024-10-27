const util = require("util");
const gc = require("../media-config");
const { Media } = require("../models");
const bucket = gc.bucket(process.env.STORAGE_MEDIA_BUCKET);

const uploadMedia = (file, path) =>
  new Promise((resolve, reject) => {
    const { originalname, buffer } = file;

    const blob = bucket.file(originalname.replace(/ /g, "_"));
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
    blobStream
      .on("finish", () => {
        const publicUrl = util.format(`${process.env.SERVER_URL}/${path}`);
        resolve(publicUrl);
      })
      .on("error", () => {
        reject(`Unable to upload image, something went wrong`);
      })
      .end(buffer);
  });

const getNewMedia = ({ _id: userId = "642db00780cda924f6eb8865" }) =>
  Media.create({ user: [userId] });

module.exports = {
  uploadMedia,
  getNewMedia,
};
