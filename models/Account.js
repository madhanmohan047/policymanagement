const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const accountSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        default: () => generateId() 
    },
    accountNumber: { 
        type: String, 
        unique: true, 
        trim: true 
    },
    accountHolder: { 
        type: String, 
        ref: 'Contact', 
        required: [true, 'Account holder is required'] 
    }, 
    primaryLocation: { 
        type: String, 
        ref: 'Address', 
        required: [true, 'Primary location is required'] 
    },
    status: { 
        code: { type: String, required: true }, 
        name: { type: String, required: true } 
    },
    organization: { 
        type: String, 
        ref: 'Organization', 
        required: [true, 'Organization is required'] 
    },
    producerCode: { 
        type: String, 
        ref: 'ProducerCode', 
        required: [true, 'Producer code is required'] 
    },
    createdBy: { 
        type: String, 
        ref: 'User' 
    }
}, { 
    timestamps: true,
    collection: 'db_account'
});

accountSchema.set('toJSON', { virtuals: true });
accountSchema.set('toObject', { virtuals: true });

accountSchema.pre('save', async function(next) {
    try {
        
        if (!this.accountNumber) {
            let isUnique = false;
            while (!isUnique) {
                 const randomDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
                 this.accountNumber = `A${randomDigits}`;
  
                const existing = await mongoose.model('Account').findOne({ accountNumber: this.accountNumber });
                if (!existing) {
                    isUnique = true; 
                }
            }
        }
        
        const statusExists = await mongoose.model('AccountStatus').findOne({ code: this.status.code });
        if (!statusExists) {
            throw new Error(`Invalid account status: The code "${this.status.code}" is not a valid system status.`);
        }
    } catch (error) {
        throw error;
    }
});

module.exports = mongoose.model('Account', accountSchema, 'db_account');
