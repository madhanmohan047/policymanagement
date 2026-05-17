const mongoose = require("mongoose");
const { typelistSchema } = require("./../Shared");

const ProgramPlan = new mongoose.Schema(typelistSchema, {
  collection: "tl_program_plan",
});
module.exports = mongoose.model("ProgramPlan", ProgramPlan);
