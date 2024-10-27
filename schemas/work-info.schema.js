const mongoose = require("mongoose");

const {
  MODELS: { BUSINESS },
} = require("../constants");

const { ObjectId } = mongoose.Schema.Types;

module.exports = new mongoose.Schema({
  companyName: String,
  jobTitle: String,
  startDate: Date,
  endDate: Date,
  description: String,
  business: { type: ObjectId, required: true, ref: BUSINESS },
});
