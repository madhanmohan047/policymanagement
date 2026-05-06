const mongoose = require('mongoose');
const { generateId } = require('./Shared');

const contactSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    firstName: String,
    lastName: String,
    companyName: String,
    dob: Date,
    phone: String,
    type: { 
        code: { type: String, required: true }, 
        name: { type: String, required: true } 
    },
    roles: [
        { 
            code: { type: String, required: true }, 
            name: { type: String, required: true } 
        }
    ],
    email: { type: String, unique: true, sparse: true },
    createdBy: String
}, { timestamps: true });


contactSchema.pre('save', async function(next) {
    try {
        const typeExists = await mongoose.model('ContactType').findOne({ code: this.type.code });
        if (!typeExists) {
            throw new Error(`Invalid contact type: The code "${this.type.code}" does not exist in the system.`);
        }

        if (this.roles && this.roles.length > 0) {
            const roleCodes = this.roles.map(role => role.code);
            
            
            const validRoles = await mongoose.model('ContactRole').find({ 
                code: { $in: roleCodes } 
            });

            if (validRoles.length !== this.roles.length) {
                const validCodes = validRoles.map(r => r.code);
                const invalidCode = roleCodes.find(code => !validCodes.includes(code));
                throw new Error(`Invalid role: The code "${invalidCode}" does not exist in the system.`);
            }
        }
    } catch (error) {
        throw error;
    }
});

module.exports = mongoose.model('Contact', contactSchema, 'db_contact');
