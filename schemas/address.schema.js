const mongoose = require("mongoose");

const {
  MODELS: { STATE },
  OFFICE_TYPE,
  ADDRESS_TYPE,
} = require("../constants");

const { ObjectId } = mongoose.Schema.Types;

module.exports = new mongoose.Schema({
  address: String,
  officeType: {
    type: String,
    default: OFFICE_TYPE.PHYSICAL,
    enum: OFFICE_TYPE,
  },
  addressType: {
    type: String,
    default: ADDRESS_TYPE.REGISTERED,
    enum: ADDRESS_TYPE,
  },
  postalCode: String,
  city: String,
  state: { type: ObjectId, ref: STATE },
  country: String,
});
