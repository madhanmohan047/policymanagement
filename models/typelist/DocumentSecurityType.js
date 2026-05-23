const mongoose = require("mongoose");
const { typelistSchema } = require("../Shared");

const DocumentSecurityType = new mongoose.Schema(typelistSchema, {
  collection: "tl_documentsecuritytype",
});
module.exports = mongoose.model("DocumentSecurityType", DocumentSecurityType);
