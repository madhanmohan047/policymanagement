const mongoose = require('mongoose');
const { generateId } = require("./Shared");
const { typeCodeSchema } = require("./Shared");

const organizationSchema = new mongoose.Schema({
    displayName: String,
    publicId: String,
    type: String,
    groups: [{type: String, ref: 'Group'}],
    producerCodes:[{type: String, ref: 'ProducerCode'}]
}, { _id: false });


module.exports = mongoose.model('Organization', organizationSchema);