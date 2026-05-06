const mongoose = require('mongoose');
const { generateId } = require("./Shared");
const { ref } = require('node:process');

const userSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    userName: { type: String, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true }, 
    lastName: { type: String, required: true },
    type: { type: String, required: true, ref: 'UserType' },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Active'] },
    organization: { type: String, ref: 'Organization' },
    producerCode: { type: String, ref: 'Producer' },
    createdBy: { type: String, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema, 'db_user');