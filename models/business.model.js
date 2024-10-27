const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const {
  MODELS: { BUSINESS, USER },
  BUSINESS_TYPE,
  BUSINESS_STATUS,
} = require("../constants");
const addressSchema = require("../schemas/address.schema");

const { ObjectId } = mongoose.Schema.Types;

const schema = new mongoose.Schema({
  adminUser: { type: ObjectId, required: true, ref: USER },
  name: String,
  businessLogo: String,
  isGeneralCounselor: Boolean,
  businessType: {
    type: String,
    default: BUSINESS_TYPE.LLC,
    enum: BUSINESS_TYPE,
  },
  registeredDate: Date,
  EIN: String,
  businessPhone: String,
  website: String,
  businessDescription: String,
  addresses: [{ type: addressSchema }],
  status: {
    type: String,
    default: BUSINESS_STATUS.ACTIVE,
    enum: BUSINESS_STATUS,
  },
  isPublic: { type: Boolean, default: true },
});

schema.plugin(timestamps);

const Business = mongoose.model(BUSINESS, schema);

module.exports = Business;
