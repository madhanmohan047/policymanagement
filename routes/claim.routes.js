const express = require("express");
const router = express.Router();
const claimController = require("../controllers/claim.controller");

/**
 * @openapi
 * components:
 *   schemas:
 *     LookupObject:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *         name:
 *           type: string
 *
 *     ClaimDocument:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         refId:
 *           type: string
 *         name:
 *           type: string
 *         security:
 *           $ref: '#/components/schemas/LookupObject'
 *
 *     NoteToAdjuster:
 *       type: object
 *       properties:
 *         subject:
 *           type: string
 *         body:
 *           type: string
 *
 *     VehicleDamage:
 *       type: object
 *       properties:
 *         affectedAreas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LookupObject'
 *         estimatedLossAmount:
 *           type: string
 *         safetyConcern:
 *           type: boolean
 *
 *     ClaimContact:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *
 *     Claim:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         account:
 *           type: string
 *         product:
 *           $ref: '#/components/schemas/LookupObject'
 *         policy:
 *           type: string
 *         lossDate:
 *           type: string
 *           format: date-time
 *         lossCause:
 *           $ref: '#/components/schemas/LookupObject'
 *         vehicleInvolved:
 *           type: string
 *         lossLocation:
 *           type: string
 *         isInjured:
 *           type: boolean
 *         isReported:
 *           type: boolean
 *         lossDescription:
 *           type: string
 *         partiesInvolved:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClaimContact'
 *         noteToAdjuster:
 *           $ref: '#/components/schemas/NoteToAdjuster'
 *         vehicleDamaged:
 *           $ref: '#/components/schemas/VehicleDamage'
 *         documents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClaimDocument'
 *         claimNumber:
 *           type: string
 *         status:
 *           $ref: '#/components/schemas/LookupObject'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ClaimPayload:
 *       type: object
 *       properties:
 *         account:
 *           type: string
 *         product:
 *           $ref: '#/components/schemas/LookupObject'
 *         policy:
 *           type: string
 *         lossDate:
 *           type: string
 *           format: date-time
 *         lossCause:
 *           $ref: '#/components/schemas/LookupObject'
 *         vehicleInvolved:
 *           type: string
 *         lossLocation:
 *           type: string
 *         isInjured:
 *           type: boolean
 *         isReported:
 *           type: boolean
 *         lossDescription:
 *           type: string
 *         partiesInvolved:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClaimContact'
 *         noteToAdjuster:
 *           $ref: '#/components/schemas/NoteToAdjuster'
 *         vehicleDamaged:
 *           $ref: '#/components/schemas/VehicleDamage'
 *         documents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClaimDocument'
 *         status:
 *           $ref: '#/components/schemas/LookupObject'
 */

/**
 * @openapi
 * /api/claims:
 *   get:
 *     summary: Retrieve all claims
 *     tags: [Claims]
 *     responses:
 *       200:
 *         description: List of claims
 */
router.get("/", claimController.getAllClaims);

/**
 * @openapi
 * /api/claims/{claimNumber}:
 *   get:
 *     summary: Retrieve claim by claim number
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: claimNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Claim details
 *       404:
 *         description: Claim not found
 */
router.get("/:claimNumber", claimController.getClaimByNumber);

/**
 * @openapi
 * /api/claims:
 *   post:
 *     summary: Create a new claim draft
 *     tags: [Claims]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClaimPayload'
 *     responses:
 *       201:
 *         description: Claim created successfully
 */
router.post("/", claimController.createClaim);

/**
 * @openapi
 * /api/claims/{claimNumber}:
 *   put:
 *     summary: Update claim by claim number
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: claimNumber
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClaimPayload'
 *     responses:
 *       200:
 *         description: Claim updated successfully
 *       404:
 *         description: Claim not found
 */
router.put("/:claimNumber", claimController.updateClaim);

/**
 * @openapi
 * /api/claims/{claimNumber}:
 *   delete:
 *     summary: Delete claim by claim number
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: claimNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Claim deleted successfully
 *       404:
 *         description: Claim not found
 */
router.delete("/:claimNumber", claimController.deleteClaim);

module.exports = router;
