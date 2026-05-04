const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const vehicleSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    make: String,
    model: String,
    year: Number,
    vin: String,
    color: String,
    costNew: Number
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
