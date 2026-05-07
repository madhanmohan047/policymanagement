const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policy.controller');


/**
 * @openapi
 * components:
 *   schemas:
 *     Policy:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         policyNumber:
 *           type: string
 *         account:
 *           type: string
 *           description: Reference to Account
 *         product:
 *           type: object
 *           properties:
 *             code: { type: string }
 *             name: { type: string }
 *         baseState:
 *           type: object
 *           properties:
 *             code: { type: string }
 *             name: { type: string }
 *         policyStatus:
 *           type: object
 *           properties:
 *             code: { type: string }
 *             name: { type: string }
 *         premiumAmount:
 *           type: number
 *         totalAmount:
 *           type: number
 *         effectiveDate:
 *           type: string
 *           format: date-time
 *         expirationDate:
 *           type: string
 *           format: date-time
 *         issuedDate:
 *           type: string
 *           format: date-time
 *         drivers:
 *           type: array
 *           items: { type: string }
 *         vehicles:
 *           type: array
 *           items: { type: string }
 *         jobs:
 *           type: array
 *           items: { type: string }
 */

/**
 * @openapi
 * /api/policies:
 *   get:
 *     summary: Retrieve a list of all policies
 *     description: Fetches all policy records from the database.
 *     tags: [Policy]
 *     responses:
 *       200:
 *         description: A list of policies.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Policy'
 *       500:
 *         description: Server error.
 */
router.get('/', policyController.getAllPolicies);

/**
 * @openapi
 * /api/policies/{id}:
 *   get:
 *     summary: Get a policy by its unique ID
 *     description: Retrieves detailed information of a single policy, including populated references.
 *     tags: [Policy]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the policy
 *     responses:
 *       200:
 *         description: Policy details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Policy'
 *       404:
 *         description: Policy not found.
 *       500:
 *         description: Server error.
 */
router.get('/:id', policyController.getPolicyByID);

module.exports = router;
