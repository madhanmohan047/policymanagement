const mongoose = require('mongoose');
const { Job, Contact, Driver, Vehicle } = require('../models');

// ==========================================
// JOB CORE LOGIC
// ==========================================

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .select('jobNumber jobStatus jobType createdDate drivers vehicles')
            .populate('account')
            .populate('primaryInsured')
            .populate('primaryAddress')
            .populate('vehicles')
            .populate({ path: 'drivers', populate: { path: 'person' } })
            .populate({ path: 'lineCoverages', populate: { path: 'terms' } });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('account')
            .populate('primaryInsured')
            .populate('primaryAddress')
            .populate('vehicles')
            .populate({ path: 'drivers', populate: { path: 'person' } })
            .populate({ path: 'lineCoverages', populate: { path: 'terms' } });

        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateJob = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { drivers, vehicles, ...jobData } = req.body;
        const { jobId } = req.params;

        let driverIds = [];
        if (drivers && Array.isArray(drivers)) {
            driverIds = await Promise.all(drivers.map(async (d) => {
                const contact = await Contact.findOneAndUpdate(
                    { emailAddress: d.emailAddress },
                    { firstName: d.firstName, lastName: d.lastName, workPhone: d.workPhone, homePhone: d.homePhone, cellPhone: d.cellPhone, dateOfBirth: d.dateOfBirth },
                    { new: true, upsert: true, session }
                );
                const driverData = { contact: contact._id, licenseNumber: d.licenseNumber, licenseState: d.licenseState, licenseStatus: d.licenseStatus };
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
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json({ message: "Job deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==========================================
// 🏎️ DRIVER LOGIC
// ==========================================

exports.getJobDrivers = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).populate({ path: 'drivers', populate: { path: 'person' } });
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job.drivers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addOrUpdateDriver = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { 
            _id: driverId, 
            person:{ firstName, lastName,emailAddress, workPhone,homePhone, cellPhone, dateOfBirth }, 
            licenseNumber,
            licenseYear,
            licenseState,
            licenseStatus,
            numAccidents,
            numViolations,
            yearsOfExperience
        } = req.body;


        const contact = await Contact.findOneAndUpdate(
            { emailAddress }, 
            { firstName, lastName, workPhone, homePhone, cellPhone, dateOfBirth },
            { new: true, upsert: true }
        );

        const driverData = { 
            person: contact._id, 
            licenseNumber,
            licenseYear,
            licenseState,
            licenseStatus,
            numAccidents,
            numViolations,
            yearsOfExperience 
        };
        
        let driver;
        if (driverId) {
            driver = await Driver.findByIdAndUpdate(driverId, driverData, { new: true });
        } else {
            driver = new Driver(driverData);
            await driver.save();
        }

        const job = await Job.findByIdAndUpdate(
            jobId, 
            { $addToSet: { drivers: driver._id } }, 
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        res.status(201).json(driver);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.removeDriver = async (req, res) => {
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
};

// ==========================================
// VEHICLE LOGIC
// ==========================================

exports.getJobVehicles = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).populate('vehicles');
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job.vehicles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Job = require('../models/Job');
const Address = require('../models/Address');

exports.addOrUpdateVehicle = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { jobId } = req.params;
        const { vehicleId, ...vehicleData } = req.body;

        if (vehicleData.garageLocation && typeof vehicleData.garageLocation === 'object') {
            const addressDetails = vehicleData.garageLocation;
            const newAddress = await Address.create([addressDetails], { session });
            vehicleData.garageLocation = newAddress[0]._id;
        }

        let vehicle;
        if (vehicleId) {
            vehicle = await Vehicle.findByIdAndUpdate(
                vehicleId, 
                vehicleData, 
                { new: true, session }
            );
        } else {
            vehicle = new Vehicle(vehicleData);
            await vehicle.save({ session });
        }

        if (!vehicle) throw new Error("Vehicle not found");

        const job = await Job.findByIdAndUpdate(
            jobId, 
            { $addToSet: { vehicles: vehicle._id } }, 
            { new: true, session }
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
};


exports.removeVehicle = async (req, res) => {
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
};
