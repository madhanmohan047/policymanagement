const mongoose = require("mongoose");
const { typelistSchema } = require("./../Shared");

const AffectedAreas = new mongoose.Schema(typelistSchema, {
  collection: "tl_affectedareas",
});
module.exports = mongoose.model("AffectedAreas", AffectedAreas);
