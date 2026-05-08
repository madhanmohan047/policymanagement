const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');

/**
 * @openapi
 * components:
 *   schemas:
 *     LookupObject:
 *       type: object
 *       properties:
 *         code: { type: string, example: 'draft' }
 *         name: { type: string, example: 'Draft' }
 * 
 *     # --- THE ACTUAL JOB ENTITY ---
 *     Job:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         jobNumber: { type: string, example: 'JOB-1001' }
 *         jobStatus: { $ref: '#/components/schemas/LookupObject' }
 *         jobType: { $ref: '#/components/schemas/LookupObject' }
 *         account: { type: object, properties: { _id: { type: string }, accountNumber: { type: string } } }
 *         organization: { type: string }
 *         producerCode: { type: string }
 *         productName: { $ref: '#/components/schemas/LookupObject' }
 *         baseState: { $ref: '#/components/schemas/LookupObject' }
 *         preferredCoverageCurrency: { $ref: '#/components/schemas/LookupObject' }
 *         policyAddress: { type: string }
 *         primaryInsured: { type: object, properties: { _id: { type: string }, firstName: { type: string }, lastName: { type: string } } }
 *         drivers: { type: array, items: { $ref: '#/components/schemas/Driver' } }
 *         vehicles: { type: array, items: { $ref: '#/components/schemas/Vehicle' } }
 *         isUnderUWReview: { type: boolean }
 *         uwCompany: { $ref: '#/components/schemas/LookupObject' }
 *         createdAt: { type: string, format: date-time }
 * 
 *     # --- DRIVER ENTITY ---
 *     Driver:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         person: { $ref: '#/components/schemas/Contact' }
 *         licenseNumber: { type: string }
 *         licenseYear: { type: integer }
 *         licenseState: { $ref: '#/components/schemas/LookupObject' }
 *         licenseStatus: { type: string }
 *         numAccidents: { type: integer }
 *         numViolations: { type: integer }
 *         yearsOfExperience: { type: integer }
 * 
 *     # --- VEHICLE ENTITY ---
 *     Vehicle:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         make: { type: string }
 *         model: { type: string }
 *         year: { type: integer }
 *         vin: { type: string }
 *         color: { type: string }
 *         costNew: { type: number }
 *         annualMileage: { type: integer }
 *         licensePlate: { type: string }
 *         bodyType: { $ref: '#/components/schemas/LookupObject' }
 *         licenseState: { $ref: '#/components/schemas/LookupObject' }
 *         garageLocation: { $ref: '#/components/schemas/Address' }
 *         vehicleDrivers: 
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               driver: { $ref: '#/components/schemas/Driver' }
 *               yearsOfExperience: { type: integer }
 *               isPrimary: { type: boolean }
 * 
 *     # --- INPUT SCHEMAS ---
 *     DriverInput:
 *       type: object
 *       properties:
 *         _id: { type: string, description: 'Optional: Update existing' }
 *         person: { $ref: '#/components/schemas/Contact' }
 *         licenseNumber: { type: string }
 *         licenseYear: { type: integer }
 *         licenseState: { $ref: '#/components/schemas/LookupObject' }
 *         licenseStatus: { type: string }
 *         numAccidents: { type: integer }
 *         numViolations: { type: integer }
 *         yearsOfExperience: { type: integer }
 * 
 *     VehicleInput:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         make: { type: string }
 *         model: { type: string }
 *         year: { type: integer }
 *         vin: { type: string }
 *         color: { type: string }
 *         costNew: { type: number }
 *         annualMileage: { type: integer }
 *         licensePlate: { type: string }
 *         bodyType: { $ref: '#/components/schemas/LookupObject' }
 *         licenseState: { $ref: '#/components/schemas/LookupObject' }
 *         garageLocation: { $ref: '#/components/schemas/Address' }
 *         vehicleDrivers: 
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               driver: { $ref: '#/components/schemas/Driver' }
 *               yearsOfExperience: { type: integer }
 *               isPrimary: { type: boolean }
 * 
 *     JobPayload:
 *       type: object
 *       properties:
 *         account: { type: string }
 *         jobNumber: { type: string }
 *         jobStatus: { $ref: '#/components/schemas/LookupObject' }
 *         jobType: { $ref: '#/components/schemas/LookupObject' }
 *         organization: { type: string }
 *         producerCode: { type: string }
 *         productName: { $ref: '#/components/schemas/LookupObject' }
 *         baseState: { $ref: '#/components/schemas/LookupObject' }
 *         preferredCoverageCurrency: { $ref: '#/components/schemas/LookupObject' }
 *         policyAddress: { type: string }
 *         primaryInsured: { type: string }
 *         drivers: { type: array, items: { $ref: '#/components/schemas/DriverInput' } }
 *         vehicles: { type: array, items: { $ref: '#/components/schemas/VehicleInput' } }
 *         isUnderUWReview: { type: boolean }
 *         uwCompany: { $ref: '#/components/schemas/LookupObject' }
 */

// ==========================================
// JOB CORE ROUTES
// ==========================================

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     summary: Retrieve all jobs (Summary View)
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 */
router.get('/', jobController.getAllJobs);

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     summary: Retrieve full job details (Deep View)
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Full job data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 */
router.get('/:id', jobController.getJobById);

/**
 * @openapi
 * /api/jobs/{jobId}:
 *   put:
 *     summary: Deep update Job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobPayload'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 */
router.put('/:jobId', jobController.updateJob);

/**
 * @openapi
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Job deleted successfully
 */
router.delete('/:id', jobController.deleteJob);

// ==========================================
// DRIVER MANAGEMENT
// ==========================================

/**
 * @openapi
 * /api/jobs/{jobId}/drivers:
 *   get:
 *     summary: Get all drivers for a specific job
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of drivers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Driver'
 */
router.get('/:jobId/drivers', jobController.getJobDrivers);

/**
 * @openapi
 * /api/jobs/{jobId}/drivers:
 *   post:
 *     summary: Add or update a driver
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DriverInput'
 *     responses:
 *       201:
 *         description: Driver saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Driver'
 */
router.post('/:jobId/drivers', jobController.addOrUpdateDriver);

/**
 * @openapi
 * /api/jobs/{jobId}/drivers/{driverId}:
 *   delete:
 *     summary: Remove driver
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Driver removed
 */
router.delete('/:jobId/drivers/:driverId', jobController.removeDriver);

// ==========================================
// VEHICLE MANAGEMENT
// ==========================================

/**
 * @openapi
 * /api/jobs/{jobId}/vehicles:
 *   get:
 *     summary: Get all vehicles for a specific job
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 */
router.get('/:jobId/vehicles', jobController.getJobVehicles);

/**
 * @openapi
 * /api/jobs/{jobId}/vehicles:
 *   post:
 *     summary: Add or update a vehicle
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehicleInput'
 *     responses:
 *       201:
 *         description: Vehicle saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 */
router.post('/:jobId/vehicles', jobController.addOrUpdateVehicle);

/**
 * @openapi
 * /api/jobs/{jobId}/vehicles/{vehicleId}:
 *   delete:
 *     summary: Remove vehicle
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vehicle removed
 */
router.delete('/:jobId/vehicles/:vehicleId', jobController.removeVehicle);

module.exports = router;