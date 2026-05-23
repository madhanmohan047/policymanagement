const mongoose = require("mongoose");
const { generateId } = require("./Shared");

const claimDocumentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => generateId(),
    },

    refId: {
      type: String,
    },

    name: {
      type: String,
    },

    security: {
      code: { type: String },
      name: { type: String },
    },
  },
  {
    timestamps: true,
    collection: "db_claimdocument",
  },
);
claimDocumentSchema.pre("save", async function () {
  const typeExists = await mongoose
    .model("DocumentSecurityType")
    .findOne({ code: this.security.code });

  if (!typeExists) {
    throw new Error(
      `Invalid document security type: "${this.security.code}" does not exist.`,
    );
  }
});
module.exports = mongoose.model("ClaimDocument", claimDocumentSchema);
