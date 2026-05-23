const mongoose = require("mongoose");
const { typelistSchema } = require("./../Shared");

const ClaimContactRole = new mongoose.Schema(typelistSchema, {
  collection: "tl_claimcontactrole",
});
module.exports = mongoose.model("ClaimContactRole", ClaimContactRole);
