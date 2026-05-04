const express = require('express');
const router = express.Router();
const { Job, Contact, Driver, Vehicle, Account } = require('../models');

// --- JOB ROUTES ---

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     summary: Retrieve all jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().select('jobNumber jobStatus jobType createdDate');
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



/**
 * @openapi
 * /api/jobs/{jobId}:
 *   put:
 *     summary: Update Job, Drivers, and Vehicles using Job ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobPayload'
 *     responses:
 *       200:
 *         description: Job deep updated
 */
router.put('/:jobId', async (req, res) => {
    try {
        const { drivers, vehicles, ...jobData } = req.body;
        const { jobId } = req.params;

        // Process Drivers
        let driverIds = [];
        if (drivers && Array.isArray(drivers)) {
            driverIds = await Promise.all(drivers.map(async (d) => {
                const contact = await Contact.findOneAndUpdate(
                    { email: d.email },
                    { firstName: d.firstName, lastName: d.lastName, phone: d.phone },
                    { new: true, upsert: true }
                );
                const driverUpdate = { contactId: contact._id, licenseNumber: d.licenseNumber, licenseState: d.licenseState, licenseStatus: d.licenseStatus };
                const driver = d._id ? await Driver.findByIdAndUpdate(d._id, driverUpdate, { new: true }) : await new Driver(driverUpdate).save();
                return driver._id;
            }));
        }

        // Process Vehicles
        let vehicleIds = [];
        if (vehicles && Array.isArray(vehicles)) {
            vehicleIds = await Promise.all(vehicles.map(async (v) => {
                const vehicle = v._id ? await Vehicle.findByIdAndUpdate(v._id, v, { new: true }) : await new Vehicle(v).save();
                return vehicle._id;
            }));
        }

        const finalJobData = {
            ...jobData,
            ...(driverIds.length > 0 && { $addToSet: { drivers: { $each: driverIds } } }),
            ...(vehicleIds.length > 0 && { $addToSet: { vehicles: { $each: vehicleIds } } })
        };

        const updatedJob = await Job.findByIdAndUpdate(jobId, finalJobData, { new: true })
            .populate({ path: 'drivers', populate: { path: 'contactId' } })
            .populate('vehicles');

        if (!updatedJob) return res.status(404).json({ message: "Job not found" });
        res.json(updatedJob);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @openapi
 * /api/jobs/{jobId}/drivers:
 *   post:
 *     summary: Add a driver directly to a job by Job ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DriverInput'
 */
router.post('/:jobId/drivers', async (req, res) => {
    try {
        const { jobId } = req.params;
        const { firstName, lastName, email, phone, licenseNumber, licenseState, licenseStatus } = req.body;

        const contact = await Contact.findOneAndUpdate(
            { email: email }, 
            { firstName, lastName, phone },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        const newDriver = new Driver({ contactId: contact._id, licenseNumber, licenseState, licenseStatus });
        await newDriver.save();

        const job = await Job.findByIdAndUpdate(
            jobId,
            { $push: { drivers: newDriver._id } },
            { new: true }
        ).populate({ path: 'drivers', populate: { path: 'contactId' } });

        if (!job) return res.status(404).json({ message: "Job not found" });
        res.status(201).json(job.drivers);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @openapi
 * /api/jobs/{jobId}/vehicles:
 *   post:
 *     summary: Add a vehicle directly to a job by Job ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehicleInput'
 */
router.post('/:jobId/vehicles', async (req, res) => {
    try {
        const { jobId } = req.params;
        const newVehicle = new Vehicle(req.body);
        await newVehicle.save();

        const job = await Job.findByIdAndUpdate(
            jobId, 
            { $push: { vehicles: newVehicle._id } },
            { new: true }
        ).populate('vehicles');

        if (!job) return res.status(404).json({ message: "Job not found" });
        res.status(201).json(job.vehicles);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     summary: Retrieve Job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Full job data
 */
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('primaryInsured')
            .populate('vehicles')
            .populate({ path: 'lineCoverages', populate: { path: 'terms' } });
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @openapi
 * /api/jobs/{jobId}/drivers:
 *   get:
 *     summary: Get all drivers for a specific job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *     responses:
 *       200:
 *         description: List of drivers with contact details
 */
router.get('/:jobId/drivers', async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId)
            .populate({
                path: 'drivers',
                populate: { path: 'contactId' }
            });

        if (!job) return res.status(404).json({ message: "Job not found" });

        // Map to a flattened structure for easier frontend consumption
        const formattedDrivers = job.drivers.map(d => ({
            driverId: d._id,
            licenseNumber: d.licenseNumber,
            licenseState: d.licenseState,
            licenseStatus: d.licenseStatus,
            ...d.contactId.toObject()
        }));

        res.json(formattedDrivers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @openapi
 * /api/jobs/{jobId}/vehicles:
 *   get:
 *     summary: Get all vehicles for a specific job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 */
router.get('/:jobId/vehicles', async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId)
            .populate('vehicles');

        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job.vehicles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @openapi
 * /api/jobs/{jobId}/coverages:
 *   get:
 *     summary: Get all coverages and terms for a specific job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 */
router.get('/:jobId/coverages', async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId)
            .populate({
                path: 'lineCoverages',
                populate: { path: 'terms' }
            });

        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job.lineCoverages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;