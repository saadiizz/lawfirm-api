const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const {
  MODELS: { MEDIA, USER },
} = require("../constants");

const { ObjectId } = mongoose.Schema.Types;

const schema = new mongoose.Schema({
  user: [{ type: ObjectId, ref: USER }],
});

schema.plugin(timestamps);

const Media = mongoose.model(MEDIA, schema);

module.exports = Media;
