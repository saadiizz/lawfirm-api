const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const {
  MODELS: { LANGUAGE },
} = require("../constants");

const schema = new mongoose.Schema({
  name: String
});

schema.plugin(timestamps);

const Language = mongoose.model(LANGUAGE, schema);

module.exports = Language;