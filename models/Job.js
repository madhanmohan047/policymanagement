const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const jobSchema = new mongoose.Schema({
    _id: { type: String, default: () => generateId() },
    account: { type: String, ref: 'Account', required: true },
    jobNumber: { type: String, unique: true },
    jobStatus: { code: { type: String, required: true }, name: { type: String, required: true } },
    jobType: { code: { type: String, required: true }, name: { type: String, required: true } },
    product: { code: { type: String, required: true }, name: { type: String, required: true } },
    baseState: { code: { type: String, required: true }, name: { type: String, required: true } },
    preferredCoverageCurrency: { code: { type: String, required: true }, name: { type: String, required: true } },
    uwCompany: { code: { type: String }, name: { type: String } },
    createdDate: { type: Date, default: Date.now },
    effectiveDate: { type: Date, required: true },
    organization: { type: String, ref: 'Organization', required: true },
    producerCode: { type: String, ref: 'ProducerCode', required: true },
    primaryAddress: { type: String, ref: 'Address'},
    primaryInsured: { type: String, ref: 'Contact' },
    drivers: [{ type: String, ref: 'Driver' }],
    vehicles: [{ type: String, ref: 'Vehicle' }],
    lineCoverages: [{ type: String, ref: 'Coverage' }], 
    isUnderUWReview: { type: Boolean, default: false },
}, { timestamps: true, collection: 'db_job' });

jobSchema.pre('save', async function() {
    if (!this.jobNumber) {
        const randomNum = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
        this.jobNumber = randomNum;
    }

    if (this.isNew && (!this.jobStatus || !this.jobStatus.code)) {
        this.jobStatus = { code: 'draft', name: 'Draft' };
    }

    const validations = [
        { field: 'jobStatus', collection: 'JobStatus' },
        { field: 'jobType', collection: 'JobType' },
        { field: 'product', collection: 'Product' },
        { field: 'baseState', collection: 'State' },
        { field: 'preferredCoverageCurrency', collection: 'Currency' },
    ];

    for (const item of validations) {
        const value = this[item.field];
        if (value && value.code) {
            const exists = await mongoose.model(item.collection).findOne({ code: value.code });
            if (!exists) {
                throw new Error(`Invalid ${item.field}: The code "${value.code}" does not exist in ${item.collection}.`);
            }
        }
    }
});

module.exports = mongoose.model('Job', jobSchema);
