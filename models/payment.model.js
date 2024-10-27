const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const {
  MODELS: { USER },
} = require("../constants");

const { ObjectId } = mongoose.Schema.Types;

const schema = new mongoose.Schema({
  user_id: { type: ObjectId, ref: USER },
  payment_gateway: String,
  payment_method_id: String,
  // card: {
  //   brand: string;
  //   exp_month: number;
  //   exp_year: number;
  //   last4: string;
  // };
  is_default: Boolean,
});

schema.plugin(timestamps);

const Payment = mongoose.model("payment", schema);

module.exports = Payment;
