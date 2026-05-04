const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const userSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    accountNumber: { type: String, unique: true },
    accountHolderId: { type: String, ref: 'Contact', required: true }, 
    primaryLocationId: { type: String, ref: 'Address', required: true },
    type: { type: String, required: true, enum: ['Person', 'Company'] },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Active'] },
    organization: String,
    producerCode: String,
    createdBy: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);