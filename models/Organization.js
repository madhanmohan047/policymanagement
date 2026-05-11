const mongoose = require('mongoose');
const { generateId } = require("./Shared");
const organizationSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    name: { type: String, required: true, trim: true },
    contact: { type: String, ref: 'Contact' }, 
    address: { type: String, ref: 'Address' },
    groups: [{ type: String, ref: 'Group' }],
    producerCodes: [{ type: String, ref: 'ProducerCode' }] 
}, { timestamps: true, collection: 'db_organization' });
module.exports = mongoose.model('Organization', organizationSchema);
