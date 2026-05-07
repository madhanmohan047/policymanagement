const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');

/**
 * @openapi
 * components:
 *   schemas:
 *     AccountInput:
 *       type: object
 *       required: [accountHolder, primaryLocation, organization, producerCode, status]
 *       properties:
 *         accountNumber: 
 *           type: string 
 *           description: Optional. If not provided, it is auto-generated as A + 9 digits.
 *         accountHolder: 
 *           type: string 
 *           description: Reference ID of the Contact
 *         primaryLocation: 
 *           type: string 
 *           description: Reference ID of the Address
 *         organization: 
 *           type: string 
 *           description: Reference ID of the Organization
 *         producerCode: 
 *           type: string 
 *           description: Reference ID of the ProducerCode
 *         status:
 *           type: object
 *           required: [code, name]
 *           properties:
 *             code: { type: string, example: 'ACT' }
 *             name: { type: string, example: 'Active' }
 *         createdBy: 
 *           type: string 
 *           description: Reference ID of the User
 * 
 *     Account:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         accountNumber: { type: string }
 *         accountHolder: { $ref: '#/components/schemas/Contact' }
 *         primaryLocation: { $ref: '#/components/schemas/Address' }
 *         status:
 *           type: object
 *           properties:
 *             code: { type: string }
 *             name: { type: string }
 *         organization: { $ref: '#/components/schemas/Organization' }
 *         producerCode: { $ref: '#/components/schemas/ProducerCode' }
 *         createdBy: { $ref: '#/components/schemas/User' }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

/**
 * @openapi
 * /api/accounts:
 *   get:
 *     summary: Get all accounts
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: A list of accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Account' } }
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
 *       400:
 *         description: Validation error or invalid status code
 */
router.get('/', accountController.getAllAccounts);
router.post('/', accountController.createAccount);

/**
 * @openapi
 * /api/accounts/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Account details retrieved
 *       404:
 *         description: Account not found
 *   put:
 *     summary: Update account details
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccountInput'
 *     responses:
 *       200:
 *         description: Account updated successfully
 *   delete:
 *     summary: Delete an account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       404:
 *         description: Account not found
 */
router.get('/:id', accountController.getAccountById);
router.put('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

/**
 * @openapi
 * /api/accounts/{accountId}/jobs:
 *   get:
 *     summary: Get all jobs associated with a specific account
 *     description: Returns a list of all jobs (submissions, renewals, etc.) linked to the provided account ID.
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema: { type: string }
 *         description: The unique ID of the account
 *     responses:
 *       200:
 *         description: List of jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data: 
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Job' }
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.get('/:accountId/jobs', accountController.getJobsByAccount);

module.exports = router;
