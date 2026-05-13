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
 *         _id: { type: string }
 *         policyNumber: { type: string }
 *         account: { $ref: '#/components/schemas/Account' }
 *         product: { $ref: '#/components/schemas/LookupObject' }
 *         baseState: { $ref: '#/components/schemas/LookupObject' }
 *         policyStatus: { $ref: '#/components/schemas/LookupObject' }
 *         premiumAmount: { type: number }
 *         totalAmount: { type: number }
 *         effectiveDate: { type: string, format: date-time }
 *         expirationDate: { type: string, format: date-time }
 *         issuedDate: { type: string, format: date-time }
 *         drivers: { type: array, items: { $ref: '#/components/schemas/Driver' } }
 *         vehicles: { type: array, items: { $ref: '#/components/schemas/Vehicle' } }
 *         jobs: { type: array, items: { $ref: '#/components/schemas/Job' } }
 *         organization: { $ref: '#/components/schemas/Organization' }
 *         producerCode: { $ref: '#/components/schemas/ProducerCode' }
 *         primaryAddress: { $ref: '#/components/schemas/Address' }
 *         primaryInsured: { $ref: '#/components/schemas/Contact' }
 */

/**
 * @openapi
 * /api/policies:
 *   get:
 *     summary: Retrieve a list of all policies
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
 * /api/policies/recently-viewed:
 *   get:
 *     summary: Retrieve a list of all recently viewed policies
 *     tags: [Policy]
 *     responses:
 *       200:
 *         description: A list of recently viewed policies.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Policy'
 *       500:
 *         description: Server error.
 */
router.get('/recently-viewed', policyController.getRecentlyViewedPolicies);

/**
 * @openapi
 * /api/policies/{id}:
 *   get:
 *     summary: Get a policy by its unique ID
 *     tags: [Policy]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
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
