const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const addressSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    createdBy: String
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);