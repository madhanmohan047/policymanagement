const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const producerCodeSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    code: String,
    displayName: String,
    publicId: String,
    organizationId: { type: String, ref: 'Organization' }
}, { timestamps: true });


module.exports = mongoose.model('ProducerCode', producerCodeSchema);