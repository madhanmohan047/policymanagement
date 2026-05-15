const mongoose = require("mongoose");
const { typelistSchema } = require("./../Shared");

const ClaimStatus = new mongoose.Schema(typelistSchema, {
  collection: "tl_claimstatus",
});
module.exports = mongoose.model("ClaimStatus", ClaimStatus);
