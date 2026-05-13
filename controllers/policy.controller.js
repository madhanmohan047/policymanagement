const { Policy, User, RecentlyViewed } = require('./../models');
const axios = require('axios');

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

exports.getRecentlyViewedPolicies = async (req, res) => {
    try {
        const user = req.user;
        
        if (user) {
            const recentlyViewed = await RecentlyViewed.findOne({ user: user._id.toString() })
                .populate({
                    path: 'accounts.account',
                    model: 'Account'          
                })
                .populate({
                    path: 'policies.policy',  
                    model: 'Policy'          
                });

            return res.status(200).json({
                success: true,
                data: { policies: recentlyViewed.policies.map(p => p.policy) }
            });
        } else {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
    } catch (error) {
        console.error("Error fetching recently viewed policies:", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
