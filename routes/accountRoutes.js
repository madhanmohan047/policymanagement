const express = require('express');
const router = express.Router();
const { Account, Address, Contact, Job } = require('../models'); 


/**
 * @openapi
 * /api/accounts:
 *   get:
 *     summary: Retrieve all accounts
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: A list of accounts
 */
router.get('/', async (req, res) => {
    try {
        const accounts = await Account.find()
            .populate('accountHolder')
            .populate('primaryLocation')
            .sort({ createdAt: -1 }); 
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch accounts", message: err.message });
    }
});

/**
 * @openapi
 * /api/accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccountInput'
 *     responses:
 *       201:
 *         description: Account created successfully
 */
router.post('/', async (req, res) => {
    const { accountHolder, primaryLocation, producerCode, organization } = req.body;
    const currentUser = req.userContext?.id || 'system';

    let createdAddressId = null;
    let createdContactId = null;

    try {
        
        const newAddress = new Address({ ...primaryLocation });
        await newAddress.save();
        createdAddressId = newAddress._id;


        const newContact = new Contact({ ...accountHolder });
        await newContact.save();
        createdContactId = newContact._id;


        const newAccount = new Account({
            accountHolder: createdContactId,
            primaryLocation: createdAddressId,
            producerCode,
            organization,
            createdBy: currentUser,
            status: { code: 'pending', name: 'Pending' } 
        });

        await newAccount.save();

        await newAccount.populate(['accountHolder', 'primaryLocation']);
        res.status(201).json(newAccount);

    } catch (err) {
        if (createdAddressId) await Address.findByIdAndDelete(createdAddressId);
        if (createdContactId) await Contact.findByIdAndDelete(createdContactId);
        
        res.status(400).json({ 
            error: "Failed to create account bundle", 
            message: err.message 
        });
    }
});

/**
 * @openapi
 * /api/accounts/{id}:
 *   get:
 *     summary: Get account details by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Account found
 */
router.get('/:id', async (req, res) => {
    try {
        const account = await Account.findById(req.params.id)
            .populate('accountHolder')
            .populate('primaryLocation');
        if (!account) return res.status(404).send("Account not found");
        res.json(account);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @openapi
 * /api/accounts/{accountId}/submissions:
 *   post:
 *     summary: Create a new Submission for an account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmissionInput'
 */
router.post('/:accountId/submissions', async (req, res) => {
    try {
        const { accountId } = req.params;
        const { 
            product,
            effectiveDate
        } = req.body;

        const account = await Account.findById(accountId);
        await account.populate(['accountHolder', 'primaryLocation']);
        if (!account) return res.status(404).json({ message: "Account not found" });

        const baseState = account.primaryLocation?.state;

 
        const newJob = new Job({
            account: accountId,
            organization: account.organization,
            producerCode: account.producerCode, 
            primaryInsured: account.accountHolder,
            jobType: { code: 'submission', name: 'New Business' },
            jobStatus: { code: 'draft', name: 'Draft' },
            product: product,
            baseState: baseState,
            preferredCoverageCurrency: { code: 'usd', name: 'USD' },
            drivers: [],
            vehicles: [],
            effectiveDate: effectiveDate
        });

        const savedJob = await newJob.save();
        const result = await Job.findById(savedJob._id).populate(['primaryInsured', 'account']);

        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: "Failed to create submission", message: err.message });
    }
});


/**
 * @openapi
 * /api/accounts/{accountId}/jobs:
 *   get:
 *     summary: Get all jobs for an account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *     responses:
 *       200:
 *         description: List of jobs for the account
 *       404:
 *         description: Account not found
 */
router.get('/:accountId/jobs', async (req, res) => {
    try {
        const { accountId } = req.params;

        const jobs = await Job.find({ account: accountId })
            .populate('primaryInsured')
            .populate('account');

        res.status(200).json(jobs);
    } catch (err) {
        res.status(400).json({ error: "Failed to retrieve jobs", message: err.message });
    }
});



module.exports = router;
