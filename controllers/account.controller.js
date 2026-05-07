const Account = require('../models/Account'); 
const { Job } = require('../models');


const accountPopulate = [
    { path: 'accountHolder' },
    { path: 'primaryLocation' },
    { path: 'organization' },
    { path: 'producerCode' },
    { path: 'createdBy' }
];

/**
 * Get all accounts
 */
exports.getAllAccounts = async (req, res) => {
    try {
        const accounts = await Account.find().populate(accountPopulate);
        res.status(200).json({
            success: true,
            count: accounts.length,
            data: accounts
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Get account by ID
 */
exports.getAccountById = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id).populate(accountPopulate);
        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }
        res.status(200).json({ success: true, data: account });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Create a new account
 */
exports.createAccount = async (req, res) => {
    try {
        // Note: accountNumber is auto-generated in the pre-save hook if not provided
        const account = new Account(req.body);
        const savedAccount = await account.save();
        
        // Populate the newly created account before returning
        const populatedAccount = await Account.findById(savedAccount._id).populate(accountPopulate);
        
        res.status(201).json({
            success: true,
            data: populatedAccount
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

/**
 * Update account
 */
exports.updateAccount = async (req, res) => {
    try {
        const updatedAccount = await Account.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate(accountPopulate);

        if (!updatedAccount) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        res.status(200).json({ success: true, data: updatedAccount });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

/**
 * Delete account
 */
exports.deleteAccount = async (req, res) => {
    try {
        const account = await Account.findByIdAndDelete(req.params.id);
        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }
        res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Get all jobs associated with a specific account
 */
exports.getJobsByAccount = async (req, res) => {
    try {
        const { accountId } = req.params;

        const jobs = await Job.find({ account: accountId })
            .populate('account organization producerCode primaryInsured')
            .lean();

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
