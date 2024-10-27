const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const {
  MODELS: { USER, CATEGORY },
  USER_Type,
  DESIGNATION_TYPE,
  BILLING_STRUCTURE,
  REPRESENT_TYPE,
} = require("../constants");

const { ObjectId } = mongoose.Schema.Types;
const LanguageSchema = require("../schemas/language.schema");
const LicenseSchema = require("../schemas/license.schema");
const stateSchema = require("../schemas/state.schema");
const experienceSchema = require("../schemas/experience.schema");
const workInfoSchema = require("../schemas/work-info.schema");
const AddressSchema = require("../schemas/address.schema");

const schema = new mongoose.Schema({
  profilePicture: String,
  firstName: String,
  lastName: String,
  phone: String,
  email: String,
  password: String,
  verificationToken: Number,
  userType: { type: String, default: USER_Type.INDIVIDUAL, enum: USER_Type },
  isEmailVerified: Boolean,
  emailVerificationAttempts: Number,
  designation: {
    type: String,
    default: DESIGNATION_TYPE.OTHER,
    enum: DESIGNATION_TYPE,
  },
  roleAtCompany: String,
  stepsCompleted: Number,
  firmName: String,
  firmWebsite: String,
  billingStructure: {
    type: [String],
    default: BILLING_STRUCTURE.FIXED_FEE,
    enum: BILLING_STRUCTURE,
  },
  ratePerHourMin: Number,
  ratePerHourMax: Number,
  onContingency: Number,
  languages: [{ type: LanguageSchema }],
  represent: {
    type: [String],
    default: REPRESENT_TYPE.INDIVIDUAL,
    enum: REPRESENT_TYPE,
  },
  practiceAreas: [{ type: ObjectId, ref: CATEGORY }],
  practicingLawSince: { type: Date, default: Date.now() },
  licenses: [{ type: LicenseSchema }],
  locationPermitted: [{ type: stateSchema }],
  biography: String,
  experiences: [{ type: experienceSchema }],
  workInfo: [{ type: workInfoSchema }],
  addresses: [{ type: AddressSchema }],
  stripeCustomerId: String,
});

schema.plugin(timestamps);

const User = mongoose.model(USER, schema);

module.exports = User;
