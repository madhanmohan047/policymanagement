const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const vehicleSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        default: () => generateId() 
    },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    vin: { type: String, required: true, unique: true },
    color: { type: String },
    costNew: { type: Number },
    annualMileage: { type: Number },
    licensePlate: { type: String },
    bodyType: { 
        type: String, 
        ref: 'VehicleBodyType', 
        required: true 
    },
    licenseState: { 
        type: String, 
        ref: 'State' 
    },
    garageLocation: { 
        type: String, 
        ref: 'Address' 
    },
    vehicleDrivers: [{
        driver: { 
            type: String, 
            ref: 'Driver', 
            required: true 
        },
        yearsOfExperience: { 
            type: Number, 
            default: 0 
        },
        isPrimary: { 
            type: Boolean, 
            default: false 
        }
    }],

}, { 
    timestamps: true,
    collection: 'db_vehicle' 
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
