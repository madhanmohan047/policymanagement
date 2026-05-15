const mongoose = require("mongoose");
const { generateId } = require("./Shared");

const claimSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => generateId() },
    account: { type: String, ref: "Account", required: true },
    product: {
      code: { type: String, required: true },
      name: { type: String, required: true },
    },
    policy: { type: String, ref: "Policy", required: true },
    lossDate: { type: Date },
    lossCause: {
      code: { type: String, required: true },
      name: { type: String, required: true },
    },
    vehicleInvolved: { type: String, ref: "Vehicle", required: true },
    lossLocation: { type: String, ref: "Address", required: true },
    isInjured: { type: Boolean, default: false },
    isReported: { type: Boolean, default: false },
    lossDescription: { type: String, required: true },
    partiesInvolved: [{ type: String, ref: "Contact", required: true }],
    noteToAdjuster: {
      subject: { type: String, required: true },
      body: { type: String, required: true },
    },

    vehicleDamaged: {
      affectedAreas: [
        {
          code: { type: String, required: true },
          name: { type: String, required: true },
        },
      ],
      estimatedLossAmount: { type: String, default: "0" },
      safetyConcern: { type: Boolean, default: true },
    },
    documents: [
      {
        _id: { type: String, required: true },
        refId: { type: String, required: true },
        name: { type: String, required: true },
        security: {
          code: { type: String, required: true },
          name: { type: String, required: true },
        },
      },
    ],
    claimNumber: { type: String, required: "" },
    status: {
      code: { type: String, required: true },
      name: { type: String, required: true },
    },
  },
  {
    timestamps: true,
    collection: "db_claim",
  },
);

module.exports = mongoose.model("Claim", claimSchema);
