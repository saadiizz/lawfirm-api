const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const {
  MODELS: { USER },
} = require("../constants");

const { ObjectId } = mongoose.Schema.Types;

const schema = new mongoose.Schema({
  lawyer: { type: ObjectId, ref: USER },
  user: { type: ObjectId, ref: USER },
});

schema.plugin(timestamps);

const ProfileClick = mongoose.model("profile-click", schema);

module.exports = ProfileClick;
