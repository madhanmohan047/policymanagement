const express = require('express');
const router = express.Router();
const { Account, Address, Contact } = require('../models');

// --- ACCOUNT ROUTES ---

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
            .populate('accountHolderId')
            .populate('primaryLocationId')
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
    const { accountHolder, primaryLocation, producerCode, type, organization } = req.body;
    const currentUser = req.userContext.id;

    try {
        const newAddress = new Address({ ...primaryLocation });
        await newAddress.save();

        const newContact = new Contact({ ...accountHolder });
        await newContact.save();

        const newAccount = new Account({
            accountHolderId: newContact._id,
            primaryLocationId: newAddress._id,
            accountNumber: `ACT${Math.floor(100000 + Math.random() * 900000)}`,
            producerCode,
            type,
            organization,
            createdBy: currentUser,
            status: 'Active'
        });
        await newAccount.save();

        await newAccount.populate(['accountHolderId', 'primaryLocationId']);
        res.status(201).json(newAccount);
    } catch (err) {
        res.status(400).json({ error: "Failed to create account bundle", message: err.message });
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
            .populate('accountHolderId')
            .populate('primaryLocationId');
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
        const { lobCode } = req.body;

        const account = await Account.findById(accountId);
        if (!account) return res.status(404).json({ message: "Account not found" });

        const newJob = new Job({
            accountId: accountId,
            jobType: { code: 'submission', name: 'New Business' },
            lobCode: lobCode || 'PA',
            primaryInsured: account.accountHolderId,
            drivers: [],
            vehicles: []
        });

        const savedJob = await newJob.save();
        const result = await Job.findById(savedJob._id).populate('primaryInsured');

        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: "Failed to create submission", message: err.message });
    }
});

module.exports = router;