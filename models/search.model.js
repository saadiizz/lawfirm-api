const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const {
  MODELS: { SEARCH, CATEGORY, USER },
  SEARCH_KIND,
  SEARCH_STATUS,
} = require("../constants");

const { ObjectId } = mongoose.Schema.Types;

const schema = new mongoose.Schema({
  kind: { type: String, default: SEARCH_KIND.CATEGORY, enum: SEARCH_KIND },
  text: String,
  name: String,
  school: String,
  association: String,
  id: Number,
  category: { type: ObjectId, ref: CATEGORY },
  bookmarkedLawyers: [{ type: ObjectId, ref: USER }],
  foundLawyers: [{ type: ObjectId, ref: USER }],
  status: { type: String, default: SEARCH_STATUS.ACTIVE },
  user: { type: ObjectId, ref: USER },
});

schema.plugin(timestamps);

const Search = mongoose.model(SEARCH, schema);

module.exports = Search;
