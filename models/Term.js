const mongoose = require('mongoose');
const { generateId } = require("./Shared");
const termSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    name: String,
    covTermType: String,
    choiceValue: mongoose.Schema.Types.Mixed,
    booleanValue: Boolean,
    stringValue: String,
    directValue: String,
    dateValue: String,
    createdBy: String
}, { timestamps: true, collection: 'db_term' });
module.exports = mongoose.model('Term', termSchema);
