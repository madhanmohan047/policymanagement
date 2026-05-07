const { Policy } = require('./../models');

exports.getAllPolicies = async (req, res) => {
    try {
        const policies = await Policy.find()
        .populate('account')
        .populate('organization')
        .populate('producerCode')
        .populate('primaryAddress')
        .populate('primaryInsured')
        .populate('drivers')
        .populate('vehicles')
        .populate('lineCoverages')
        .populate('jobs')
        .lean();
        res.status(200).json({
            success: true,
            data: policies
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPolicyByID = async (req, res) => {
    try {
        const { id } = req.params;
        
        const policy = await Policy.findById(id)
            .populate('account')
            .populate('organization')
            .populate('producerCode')
            .populate('primaryAddress')
            .populate('primaryInsured')
            .populate('drivers')
            .populate('vehicles')
            .populate('lineCoverages')
            .populate('jobs')
            .lean();

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
