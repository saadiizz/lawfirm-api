const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const {
  MODELS: { STATE },
} = require("../constants");

const schema = new mongoose.Schema({
  name: String,
  code: String,
});

schema.plugin(timestamps);

const State = mongoose.model(STATE, schema);

module.exports = State;
