const express = require('express');
const router = express.Router();
const activityCtrl = require('../controllers/activity.controller');
const { authGuard } = require('../middleware/auth');

/**
 * @openapi
 * /api/activities:
 *   post:
 *     summary: Create a new activity and assign it to a user
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityInput'
 *     responses:
 *       201:
 *         description: Activity created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       401:
 *         description: Unauthorized.
 */
router.post('/activities', authGuard, activityCtrl.createActivity);

/**
 * @openapi
 * /api/activities/{activityId}/close:
 *   patch:
 *     summary: Close an activity (Only the assigned user can perform this)
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Activity closed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       403:
 *         description: Forbidden - You are not the assigned user.
 *       404:
 *         description: Activity not found.
 */
router.patch('/activities/:activityId/close', authGuard, activityCtrl.closeActivity);

/**
 * @openapi
 * /api/accounts/{accountId}/activities:
 *   get:
 *     summary: Get all activities for a specific account
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: A list of activities.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: 
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Account not found.
 */
router.get('/accounts/:accountId/activities', authGuard, activityCtrl.getAccountActivities);

module.exports = router;
