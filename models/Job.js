const mongoose = require('mongoose');
const { generateId, typeCodeSchema } = require("./Shared");

const jobSchema = new mongoose.Schema({
     _id: { type: String, default: () => generateId() },
    accountId: { type: String, ref: 'Account', required: true },
    jobNumber: { type: String, unique: true },
    jobStatus: typeCodeSchema,
    jobType: typeCodeSchema,
    createdDate: { type: Date, default: Date.now },
    jobEffectiveDate: Date,
    organizationId: { type: String, ref: 'Organization', required: true },
    producerCodeId: { type: String, ref: 'ProducerCode', required: true },
    productName: String,
    baseState: typeCodeSchema,
    preferredCoverageCurrency: typeCodeSchema,
    policyAddress: {
        addressLine1: String,
        city: String,
        state: typeCodeSchema,
        postalCode: String,
        displayName: String
    },
    primaryInsured: { type: String, ref: 'Contact' },
    drivers: [{ type: String, ref: 'Driver' }],
    vehicles: [{ type: String, ref: 'Vehicle' }],
    lineCoverages: [{ type: String, ref: 'Coverage' }], 
    isUnderUWReview: { type: Boolean, default: false },
    uwCompany: {
        code: String,
        name: String,
        displayName: String
    }
}, { timestamps: true });

jobSchema.pre('save', async function (next) {
    if (!this.jobNumber) {
        const year = new Date().getFullYear();
        const randomSuffix = Math.random().toString(36).toUpperCase().substring(2, 6);
        this.jobNumber = `JOB-${year}-${randomSuffix}`;
    }
    if (this.isNew) {
        this.jobStatus = { code: 'draft', name: 'Draft' };
    }
});

module.exports = mongoose.model('Job', jobSchema);