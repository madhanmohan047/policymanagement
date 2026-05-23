const mongoose = require("mongoose");
const { generateId } = require("./Shared");

const claimContactSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => generateId() },
    pcSystemId: String,
    firstName: String,
    lastName: String,
    companyName: String,
    dateOfBirth: Date,
    workPhone: String,
    homePhone: String,
    cellPhone: String,
    type: {
      code: { type: String, required: true },
      name: { type: String, required: true },
    },
    roles: [
      {
        code: { type: String, required: true },
        name: { type: String, required: true },
      },
    ],
    emailAddress: { type: String, unique: true, sparse: true },
    createdBy: String,
  },
  { timestamps: true, collection: "db_claimcontact" },
);

claimContactSchema.pre("save", async function () {
  const typeExists = await mongoose
    .model("ContactType")
    .findOne({ code: this.type.code });
  if (!typeExists) {
    throw new Error(
      `Invalid contact type: The code "${this.type.code}" does not exist.`,
    );
  }

  if (this.roles && this.roles.length > 0) {
    const roleCodes = this.roles.map((role) => role.code);
    const validRoles = await mongoose
      .model("ClaimContactRole")
      .find({ code: { $in: roleCodes } });

    if (validRoles.length !== this.roles.length) {
      const validCodes = validRoles.map((r) => r.code);
      const invalidCode = roleCodes.find((code) => !validCodes.includes(code));
      throw new Error(
        `Invalid role: The code "${invalidCode}" does not exist.`,
      );
    }
  }
});

module.exports = mongoose.model("ClaimContact", claimContactSchema);
