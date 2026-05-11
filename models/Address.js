const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const addressSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    addressLine1: { type: String, required: [true, 'Address line 1 is required'], trim: true },
    city: { type: String, required: [true, 'City is required'], trim: true },
    state: { 
        code: { type: String, required: true }, 
        name: { type: String, required: true } 
    },
    postalCode: { type: String, required: [true, 'Postal code is required'], trim: true },
    country: { 
        code: { type: String, required: true }, 
        name: { type: String, required: true } 
    },
    createdBy: { type: String, ref: 'User' }
}, { 
    timestamps: true, 
    collection: 'db_address' 
});

addressSchema.pre('save', async function() {
    const countryExists = await mongoose.model('Country').findOne({ code: this.country.code });
    if (!countryExists) {
        throw new Error(`Invalid country: The code "${this.country.code}" is not recognized.`);
    }

    const stateExists = await mongoose.model('State').findOne({ code: this.state.code });
    if (!stateExists) {
        throw new Error(`Invalid state: The code "${this.state.code}" is not recognized.`);
    }
});

module.exports = mongoose.model('Address', addressSchema);
