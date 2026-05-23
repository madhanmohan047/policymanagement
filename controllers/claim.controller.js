const mongoose = require("mongoose");
const {
  Account,
  Address,
  Policy,
  Vehicle,
  Contact,
  Claim,
  ClaimContact,
  ClaimDocument,
} = require("../models");

// Populate config
const claimPopulate = [
  "account",
  "policy",
  "vehicleInvolved",
  "lossLocation",
  "partiesInvolved",
  "documents",
].map((field) => ({
  path: field,
  select: "-__v",
}));

const generateClaimNumber = async () => {
  const today = new Date();

  const datePart =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

  const count = await Claim.countDocuments();

  const sequence = String(count + 1).padStart(4, "0");

  return `DR_CLM-${datePart}-${sequence}`;
};

const resolveContacts = async (partiesInvolved) => {
  const contacts = [];
  for (const contact of partiesInvolved) {
    if (typeof contact === "string") {
      if (mongoose.Types.ObjectId.isValid(contact)) contacts.push(contact);
      continue;
    }
    if (!contact || typeof contact !== "object") continue;

    const { _id, ...contactData } = contact;

    if (_id) {
      contacts.push(_id);
      continue;
    }

    if (contactData.emailAddress) {
      const existing = await ClaimContact.findOne({
        emailAddress: contactData.emailAddress,
      });
      if (existing) {
        contacts.push(existing._id);
        continue;
      }
    }

    const saved = await ClaimContact.create(contactData);
    contacts.push(saved._id);
  }
  return contacts;
};

const resolveDocuments = async (documents) => {
  const docs = [];
  for (const document of documents) {
    if (typeof document === "string") {
      if (mongoose.Types.ObjectId.isValid(document)) docs.push(document);
      continue;
    }
    if (!document || typeof document !== "object") continue;
    const { _id, ...documentData } = document;
    if (_id) {
      docs.push(_id);
      continue;
    }
    if (!documentData.name || !documentData.refId) continue;
    const saved = await ClaimDocument.create(documentData);
    docs.push(saved._id);
  }
  return docs;
};

/* -------------------- GET ALL -------------------- */
exports.getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find().populate(claimPopulate);

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* -------------------- GET BY CLAIM NUMBER -------------------- */
exports.getClaimByNumber = async (req, res) => {
  try {
    const { claimNumber } = req.params;

    const claim = await Claim.findOne({ claimNumber }).populate(claimPopulate);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* -------------------- CREATE CLAIM -------------------- */
exports.createClaim = async (req, res) => {
  try {
    const {
      account,
      policy,
      partiesInvolved,
      lossLocation,
      documents,
      ...claimData
    } = req.body;

    // Resolve contacts
    const involvedContacts = Array.isArray(partiesInvolved)
      ? await resolveContacts(partiesInvolved)
      : [];

    // Resolve documents
    const involvedDocuments = Array.isArray(documents)
      ? await resolveDocuments(documents)
      : [];

    // Create address only if provided
    let addressId = null;

    if (lossLocation && typeof lossLocation === "object") {
      if (lossLocation._id) {
        addressId = lossLocation._id;
      } else {
        const savedAddress = await Address.create(lossLocation);
        addressId = savedAddress._id;
      }
    } else if (
      typeof lossLocation === "string" &&
      mongoose.Types.ObjectId.isValid(lossLocation)
    ) {
      addressId = lossLocation;
    }

    const claimNumber = await generateClaimNumber();

    const claimPayload = {
      ...claimData,
      claimNumber,
      account: account || undefined,
      policy: policy || undefined,
      partiesInvolved: involvedContacts,
      documents: involvedDocuments,
      lossLocation: addressId,
      status: claimData.status || {
        code: "draft",
        name: "Draft",
      },
    };

    const savedClaim = await Claim.create(claimPayload);

    const populatedClaim = await Claim.findById(savedClaim._id).populate(
      claimPopulate,
    );

    res.status(201).json({
      success: true,
      data: populatedClaim,
    });
  } catch (err) {
    console.error(err);

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* -------------------- UPDATE CLAIM -------------------- */
exports.updateClaim = async (req, res) => {
  try {
    const {
      account,
      policy,
      partiesInvolved,
      documents,
      lossLocation,
      ...claimData
    } = req.body;

    const { claimNumber } = req.params;

    const existingClaim = await Claim.findOne({ claimNumber });

    if (!existingClaim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    let updatePayload = { ...claimData };

    /* ---- account / policy ---- */
    if (account) updatePayload.account = account;
    if (policy) updatePayload.policy = policy;

    /* ---- contacts ---- */
    if (Array.isArray(partiesInvolved)) {
      updatePayload.partiesInvolved = await resolveContacts(partiesInvolved);
    }

    /* ---- documents ---- */
    if (Array.isArray(documents)) {
      updatePayload.documents = await resolveDocuments(documents);
    }

    /* ---- address ---- */
    if (lossLocation) {
      if (
        typeof lossLocation === "string" &&
        mongoose.Types.ObjectId.isValid(lossLocation)
      ) {
        updatePayload.lossLocation = lossLocation;
      } else if (typeof lossLocation === "object") {
        if (lossLocation._id) {
          updatePayload.lossLocation = lossLocation._id;
        } else {
          const savedAddress = await Address.create(lossLocation);
          updatePayload.lossLocation = savedAddress._id;
        }
      }
    }

    /* ---- update ---- */
    const updatedClaim = await Claim.findOneAndUpdate(
      { claimNumber },
      updatePayload,
      { new: true },
    ).populate(claimPopulate);

    res.status(200).json({
      success: true,
      data: updatedClaim,
    });
  } catch (err) {
    console.error(err);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

/* -------------------- DELETE CLAIM -------------------- */
exports.deleteClaim = async (req, res) => {
  try {
    const { claimNumber } = req.params;

    const deleted = await Claim.findOneAndDelete({ claimNumber });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Claim deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};
