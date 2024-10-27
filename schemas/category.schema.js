const mongoose = require("mongoose");

const {
  MODELS: { STATE },
} = require("../constants");

const { ObjectId } = mongoose.Schema.Types;

module.exports = new mongoose.Schema({
  name: String,
  isIndividual: Boolean,
  isBusiness: Boolean,
  isLocationDependent: Boolean,
  keywords: [String],
  states: [{ type: ObjectId, ref: STATE }],
});
