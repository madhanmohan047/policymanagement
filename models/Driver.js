const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const driverSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        default: () => generateId() 
    },
    person: { 
        type: String, 
        ref: 'Contact', 
        required: true 
    },
    licenseNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    licenseYear: { 
        type: Number, 
        required: true 
    },
    licenseState: { 
        type: String, 
        ref: 'State', 
        required: true 
    },
    licenseStatus: { 
        type: String, 
        default: 'Valid' 
    },
    numAccidents: { 
        type: Number, 
        default: 0 
    },
    numViolations: { 
        type: Number, 
        default: 0 
    },
    yearsOfExperience: { 
        type: Number, 
        default: 0 
    }

}, { 
    timestamps: true, 
    collection: 'db_driver' 
});

module.exports = mongoose.model('Driver', driverSchema);
