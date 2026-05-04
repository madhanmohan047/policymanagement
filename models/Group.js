const mongoose = require('mongoose');
const { generateId } = require("./Shared");
const { timeStamp } = require('node:console');

const groupSchema = new mongoose.Schema({
     _id: { type: String, default: () => generateId() },
    code: String,
    displayName: String,
    publicId: String,
    producerCodes:[{type: String, ref: 'ProducerCode'}],
    organizationId: { type: String, ref: 'Organization', required: true }
}, { timeStamp: true });


module.exports = mongoose.model('Group', groupSchema);