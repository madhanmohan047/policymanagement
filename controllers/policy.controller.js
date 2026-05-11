const { Policy } = require('./../models');

const policyPopulate = [
    'account',
    'organization',
    'producerCode',
    'primaryAddress',
    'primaryInsured',
    { path: 'drivers', populate: { path: 'person' } },
    { path: 'vehicles', populate: { path: 'vehicleDrivers.driver', populate: { path: 'person' } } },
    { path: 'lineCoverages', populate: { path: 'terms' } },
    'jobs'
];

exports.getAllPolicies = async (req, res) => {
    try {
        const policies = await Policy.find().populate(policyPopulate).lean();
        res.status(200).json({
            success: true,
            count: policies.length,
            data: policies
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPolicyByID = async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id).populate(policyPopulate).lean();

        if (!policy) {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }

        res.status(200).json({
            success: true,
            data: policy
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
