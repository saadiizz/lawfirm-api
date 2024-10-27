const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const {
  MODELS: { CATEGORY, STATE },
} = require("../constants");

const { ObjectId } = mongoose.Schema.Types;

const schema = new mongoose.Schema({
  name: String,
  isIndividual: Boolean,
  isBusiness: Boolean,
  isLocationDependent: Boolean,
  keywords: [String],
  states: [{ type: ObjectId, ref: STATE }],
});

schema.plugin(timestamps);

const Category = mongoose.model(CATEGORY, schema);

module.exports = Category;
