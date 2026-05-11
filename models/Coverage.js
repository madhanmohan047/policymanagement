const mongoose = require('mongoose');
const { generateId } = require("./Shared");
const coverageSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    category: String,
    selected: { type: Boolean, default: false },
    terms: [{ type: String, ref: 'Term' }],
    createdBy: String
}, { timestamps: true, collection: 'db_coverage' });
module.exports = mongoose.model('Coverage', coverageSchema);
