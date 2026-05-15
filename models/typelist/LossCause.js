const mongoose = require("mongoose");
const { typelistSchema } = require("./../Shared");

const LossCause = new mongoose.Schema(typelistSchema, {
  collection: "tl_losscause",
});
module.exports = mongoose.model("LossCause", LossCause);
