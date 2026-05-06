const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const producerCodeSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    organization: { type: String, ref: 'Organization', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ProducerCode', producerCodeSchema, 'db_producer_code');