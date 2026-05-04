const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const driverSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    contactId: { type: String, ref: 'Contact', required: true }, 
    licenseNumber: String,
    licenseState: String,
    licenseStatus: String,
    yearsOfExperience: Number,
    violations: [String]
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);