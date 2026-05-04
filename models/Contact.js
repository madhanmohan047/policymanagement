const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const contactSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    firstName: String,
    lastName: String,
    companyName: String,
    dob: Date,
    phone: String,
    email: { type: String, unique: true, sparse: true },
    roles: [{ type: String, enum: ['Primary Insured', 'Driver', 'Claimant'] }],
    createdBy: String
}, { timestamps: true });

module.exports =  mongoose.model('Contact', contactSchema);