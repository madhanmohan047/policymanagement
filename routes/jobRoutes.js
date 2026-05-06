const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { Job, Contact, Driver, Vehicle, Account } = require('../models');

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
 *     DriverInput:
 *       type: object
 *       properties:
 *         _id: { type: string, description: 'Optional: Provide ID to update existing driver' }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         email: { type: string }
 *         phone: { type: string }
 *         licenseNumber: { type: string }
 *         licenseState: { type: string }
 *         licenseStatus: { type: string }
 * 
 *     VehicleInput:
 *       type: object
 *       properties:
 *         _id: { type: string, description: 'Optional: Provide ID to update existing vehicle' }
 *         make: { type: string }
 *         model: { type: string }
 *         year: { type: integer }
 *         vin: { type: string }
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
// 📑 JOB CORE ROUTES
// ==========================================

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     summary: Retrieve all jobs (Summary View)
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of jobs with basic details
 */
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find()
            .select('jobNumber jobStatus jobType createdDate')
            .populate('account');
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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
 *         description: Full job data with all populated references
 *       404:
 *         description: Job not found
 */
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('account')
            .populate('primaryInsured')
            .populate('policyAddress')
            .populate('vehicles')
            .populate({ path: 'drivers', populate: { path: 'contactId' } })
            .populate({ path: 'lineCoverages', populate: { path: 'terms' } });

        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @openapi
 * /api/jobs/{jobId}:
 *   put:
 *     summary: Deep update Job, including Drivers and Vehicles
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
 *         description: Job deep updated successfully
 *       400:
 *         description: Validation error or Job not found
 */
router.put('/:jobId', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { drivers, vehicles, ...jobData } = req.body;
        const { jobId } = req.params;

        let driverIds = [];
        if (drivers && Array.isArray(drivers)) {
            driverIds = await Promise.all(drivers.map(async (d) => {
                const contact = await Contact.findOneAndUpdate(
                    { email: d.email },
                    { firstName: d.firstName, lastName: d.lastName, phone: d.phone },
                    { new: true, upsert: true, session }
                );
                const driverData = { contactId: contact._id, licenseNumber: d.licenseNumber, licenseState: d.licenseState, licenseStatus: d.licenseStatus };
                const driver = d._id ? await Driver.findByIdAndUpdate(d._id, driverData, { new: true, session }) : await new Driver(driverData).save({ session });
                return driver._id;
            }));
        }

        let vehicleIds = [];
        if (vehicles && Array.isArray(vehicles)) {
            vehicleIds = await Promise.all(vehicles.map(async (v) => {
                const vehicle = v._id ? await Vehicle.findByIdAndUpdate(v._id, v, { new: true, session }) : await new Vehicle(v).save({ session });
                return vehicle._id;
            }));
        }

        const updatedJob = await Job.findByIdAndUpdate(
            jobId, 
            { ...jobData, drivers: driverIds, vehicles: vehicleIds }, 
            { new: true, session }
        );

        if (!updatedJob) throw new Error("Job not found");

        await session.commitTransaction();
        res.json(updatedJob);
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ error: err.message });
    } finally {
        session.endSession();
    }
});

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
 *       404:
 *         description: Job not found
 */
router.delete('/:id', async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json({ message: "Job deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 🏎️ DRIVER MANAGEMENT
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
 *         description: List of drivers with populated contact details
 */
router.get('/:jobId/drivers', async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).populate({ path: 'drivers', populate: { path: 'contactId' } });
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job.drivers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @openapi
 * /api/jobs/{jobId}/drivers:
 *   post:
 *     summary: Add or update a driver and link to job
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
 *         description: Driver saved and linked to job
 */
router.post('/:jobId/drivers', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { jobId } = req.params;
        const { driverId, firstName, lastName, email, phone, licenseNumber, licenseState, licenseStatus } = req.body;

        const contact = await Contact.findOneAndUpdate(
            { email }, { firstName, lastName, phone },
            { new: true, upsert: true, session }
        );

        const driverData = { contactId: contact._id, licenseNumber, licenseState, licenseStatus };
        let driver;
        if (driverId) {
            driver = await Driver.findByIdAndUpdate(driverId, driverData, { new: true, session });
        } else {
            driver = new Driver(driverData);
            await driver.save({ session });
        }

        const job = await Job.findByIdAndUpdate(
            jobId, { $addToSet: { drivers: driver._id } }, { new: true, session }
        );

        if (!job) throw new Error("Job not found");
        await session.commitTransaction();
        res.status(201).json(driver);
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ error: err.message });
    } finally {
        session.endSession();
    }
});

/**
 * @openapi
 * /api/jobs/{jobId}/drivers/{driverId}:
 *   delete:
 *     summary: Remove driver from job and delete driver record
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
 *         description: Driver removed and deleted successfully
 */
router.delete('/:jobId/drivers/:driverId', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { jobId, driverId } = req.params;
        await Job.findByIdAndUpdate(jobId, { $pull: { drivers: driverId } }, { session });
        await Driver.findByIdAndDelete(driverId, { session });
        await session.commitTransaction();
        res.json({ message: "Driver removed from job and deleted" });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ error: err.message });
    } finally {
        session.endSession();
    }
});

// ==========================================
// 🚗 VEHICLE MANAGEMENT
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
 */
router.get('/:jobId/vehicles', async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).populate('vehicles');
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job.vehicles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @openapi
 * /api/jobs/{jobId}/vehicles:
 *   post:
 *     summary: Add or update a vehicle and link to job
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
 *         description: Vehicle saved and linked to job
 */
router.post('/:jobId/vehicles', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { jobId } = req.params;
        const { vehicleId, ...vehicleData } = req.body;

        let vehicle;
        if (vehicleId) {
            vehicle = await Vehicle.findByIdAndUpdate(vehicleId, vehicleData, { new: true, session });
        } else {
            vehicle = new Vehicle(vehicleData);
            await vehicle.save({ session });
        }

        const job = await Job.findByIdAndUpdate(
            jobId, { $addToSet: { vehicles: vehicle._id } }, { new: true, session }
        );

        if (!job) throw new Error("Job not found");
        await session.commitTransaction();
        res.status(201).json(vehicle);
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ error: err.message });
    } finally {
        session.endSession();
    }
});

/**
 * @openapi
 * /api/jobs/{jobId}/vehicles/{vehicleId}:
 *   delete:
 *     summary: Remove vehicle from job and delete vehicle record
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
 *         description: Vehicle removed and deleted successfully
 */
router.delete('/:jobId/vehicles/:vehicleId', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { jobId, vehicleId } = req.params;
        await Job.findByIdAndUpdate(jobId, { $pull: { vehicles: vehicleId } }, { session });
        await Vehicle.findByIdAndDelete(vehicleId, { session });
        await session.commitTransaction();
        res.json({ message: "Vehicle removed from job and deleted" });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ error: err.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;
