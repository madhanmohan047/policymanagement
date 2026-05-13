const { emit } = require('node:cluster');
const { Job, Contact, Address, Account, RecentlyViewed, User } = require('../models');
const axios = require('axios');

const accountPopulate = [
    { path: 'accountHolder' },
    { path: 'primaryLocation' },
    { path: 'organization' },
    { path: 'producerCode' },
    { path: 'createdBy' }
];

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

exports.createAccount = async (req, res) => {
    try {
        const { accountHolder, primaryLocation, ...accountData } = req.body;

        if (!accountHolder || !primaryLocation) {
            return res.status(400).json({ 
                success: false, 
                message: "Both accountHolder and primaryLocation details are required." 
            });
        }

        const newContact = new Contact(accountHolder);
        const savedContact = await newContact.save();

        const newAddress = new Address(primaryLocation);
        const savedAddress = await newAddress.save();

        const accountPayload = {
            ...accountData,
            accountHolder: savedContact._id,    
            primaryLocation: savedAddress._id, 
        };

        const account = new Account(accountPayload);
        const savedAccount = await account.save();
        
        const populatedAccount = await Account.findById(savedAccount._id)
            .populate('accountHolder')    
            .populate('primaryLocation'); 
        
        res.status(201).json({
            success: true,
            data: populatedAccount
        });
    } catch (err) {
        console.error("Error creating account:", err);
        res.status(400).json({ 
            success: false, 
            message: err.message || "An error occurred while creating the account" 
        });
    }
};

exports.updateAccount = async (req, res) => {
    try {
        const { accountHolder, primaryLocation, ...accountData } = req.body;
        const accountId = req.params.id;

        if (accountHolder && accountHolder._id) {
            await Contact.findByIdAndUpdate(
                accountHolder._id, 
                { $set: accountHolder }, 
                { new: true, runValidators: true }
            );
        }

        if (primaryLocation && primaryLocation._id) {
            await Address.findByIdAndUpdate(
                primaryLocation._id, 
                { $set: primaryLocation }, 
                { new: true, runValidators: true }
            );
        }

        const updatePayload = {
            ...accountData,
            accountHolder: accountHolder?._id,
            primaryLocation: primaryLocation?._id,
        };

        const updatedAccount = await Account.findByIdAndUpdate(
            accountId,
            { $set: updatePayload },
            { new: true, runValidators: true }
        )
        
        .populate('accountHolder')
        .populate('primaryLocation');

        if (!updatedAccount) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        res.status(200).json({ 
            success: true, 
            data: updatedAccount 
        });

    } catch (err) {
        console.error("Error updating account:", err);
        res.status(400).json({ 
            success: false, 
            message: err.message || "An error occurred while updating the account" 
        });
    }
};


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

exports.getJobsByAccount = async (req, res) => {
    try {
        const { accountId } = req.params;

        const jobs = await Job.find({ account: accountId })
            .populate('account organization producerCode primaryInsured primaryAddress')
            .populate({ path: 'drivers', populate: { path: 'person' } })
            .populate('vehicles')
            .lean();

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createJobForAccount = async (req, res) => {
    try {
        const { accountId } = req.params;
        const jobData = req.body;

        jobData.account = accountId;

        const job = new Job(jobData);
        const savedJob = await job.save();

        const populatedJob = await Job.findById(savedJob._id)
            .populate('account organization producerCode primaryInsured primaryAddress');

        res.status(201).json({
            success: true,
            data: populatedJob
        });
    } catch (err) {
        res.status(400).json({ 
            success: false, 
            message: err.message 
        });
    }
};

exports.getRecentlyViewedAccounts = async (req, res) => {
    try {
       const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'Missing Authorization Header' });
        }

        const token = authHeader.split(' ')[1]; 
        const userInfoURL = process.env.AUTH0_USERINFO_URL; 
        const userInfoResponse = await axios.get(userInfoURL, {
            headers: { Authorization: `Bearer ${token}` }
        });


        const { email, nickname } = userInfoResponse.data;
        console.log(`Authenticated User: ${nickname} (${email})`);

        const user = await User.findOne({ emailAddress: email });

        console.log(user)
        
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
                data: recentlyViewed.accounts
            });
        } else {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
    } catch (error) {
        console.error("Error fetching recently viewed accounts:", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


