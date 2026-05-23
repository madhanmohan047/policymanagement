const mongoose = require("mongoose");
const { generateId } = require("./Shared");

const claimSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => generateId(),
    },

    account: {
      type: String,
      ref: "Account",
    },

    product: {
      code: { type: String },
      name: { type: String },
    },

    policy: {
      type: String,
      ref: "Policy",
    },

    lossDate: {
      type: Date,
    },

    lossCause: {
      code: { type: String },
      name: { type: String },
    },

    vehicleInvolved: {
      type: String,
      ref: "Vehicle",
    },

    lossLocation: {
      type: String,
      ref: "Address",
    },

    isInjured: {
      type: Boolean,
      default: false,
    },

    isReported: {
      type: Boolean,
      default: false,
    },

    lossDescription: {
      type: String,
    },

    partiesInvolved: [
      {
        type: String,
        ref: "ClaimContact",
      },
    ],

    noteToAdjuster: {
      subject: { type: String },
      body: { type: String },
    },

    vehicleDamaged: {
      affectedAreas: [
        {
          code: { type: String },
          name: { type: String },
        },
      ],
      estimatedLossAmount: {
        type: String,
        default: "0",
      },
      safetyConcern: {
        type: Boolean,
        default: false,
      },
    },

    documents: [
      {
        type: String,
        ref: "ClaimDocument",
      },
    ],

    claimNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      code: {
        type: String,
        default: "DRAFT",
      },
      name: {
        type: String,
        default: "Draft",
      },
    },
  },
  {
    timestamps: true,
    collection: "db_claim",
  },
);

module.exports = mongoose.model("Claim", claimSchema);
