const mongoose = require("mongoose");

const {
  MODELS: { LANGUAGE },
  PROFICIENCY,
} = require("../constants");

const { ObjectId } = mongoose.Schema.Types;

module.exports = new mongoose.Schema({
  language: {
    type: ObjectId,
    ref: LANGUAGE,
  },
  oralProficiency: { type: String, enum: PROFICIENCY },
  writtenProficiency: { type: String, enum: PROFICIENCY },
});
