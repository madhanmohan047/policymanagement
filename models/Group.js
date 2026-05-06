const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const groupSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    name: { type: String, required: true, trim: true },
    producerCodes: [{ type: String, ref: 'ProducerCode' }],
    organizations: [{ type: String, ref: 'Organization' }] 
}, { timestamps: true });



module.exports = mongoose.model('Group', groupSchema, 'db_group');