const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const commonSubmissionFields = {
    account: { type: String, ref: 'Account', required: true },
    product: { code: { type: String, required: true }, name: { type: String, required: true } },
    baseState: { code: { type: String, required: true }, name: { type: String, required: true } },
    preferredCoverageCurrency: { code: { type: String, required: true }, name: { type: String, required: true } },
    uwCompany: { code: { type: String }, name: { type: String } },
    organization: { type: String, ref: 'Organization', required: true },
    producerCode: { type: String, ref: 'ProducerCode', required: true },
    primaryAddress: { type: String, ref: 'Address'},
    primaryInsured: { type: String, ref: 'Contact' },
    drivers: [{ type: String, ref: 'Driver' }],
    vehicles: [{ type: String, ref: 'Vehicle' }],
    lineCoverages: [{ type: String, ref: 'Coverage' }],
    effectiveDate: { type: Date, required: true },
    expirationDate: { type: Date, required: true },
};

const policySchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    ...commonSubmissionFields,
    policyNumber: { type: String, unique: true }, 
    jobs: [{ type: String, ref: 'Job', required: true }],
    policyStatus: { code: { type: String, required: true }, name: { type: String, required: true } },
    premiumAmount: { type: Number },
    taxAmount: { type: Number },
    totalAmount: { type: Number },
    issuedDate: { type: Date, default: Date.now },
}, { timestamps: true, collection: 'db_policy' });

policySchema.pre('save', async function() {
    if (!this.policyNumber) {
        let isUnique = false;
        while (!isUnique) {
            const randomDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
            const generatedNumber = `P${randomDigits}`;
            const existing = await this.constructor.findOne({ policyNumber: generatedNumber });
            if (!existing) {
                this.policyNumber = generatedNumber;
                isUnique = true; 
            }
        }
    }

    const statusExists = await mongoose.model('PolicyStatus').findOne({ code: this.policyStatus.code });
    if (!statusExists) {
        throw new Error(`Invalid policy status: The code "${this.policyStatus.code}" is not a valid system status.`);
    }
});

module.exports = mongoose.model('Policy', policySchema);
