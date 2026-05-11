const { Job, Contact, Driver, Vehicle, Address } = require('../models');

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .select('jobNumber jobStatus jobType createdDate drivers vehicles')
            .populate('account primaryInsured primaryAddress')
            .populate('vehicles')
            .populate({ path: 'drivers', populate: { path: 'person' } })
            .populate({ path: 'lineCoverages', populate: { path: 'terms' } });
        
        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('account primaryInsured primaryAddress vehicles')
            .populate({ path: 'drivers', populate: { path: 'person' } })
            .populate({ path: 'lineCoverages', populate: { path: 'terms' } });

        if (!job) return res.status(404).json({ success: false, message: "Job not found" });
        res.status(200).json({ success: true, data: job });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const { drivers, vehicles, ...jobData } = req.body;
        const { jobId } = req.params;

        let driverIds = [];
        if (drivers && Array.isArray(drivers)) {
            for (const d of drivers) {
                const contact = await Contact.findOneAndUpdate(
                    { emailAddress: d.emailAddress },
                    { firstName: d.firstName, lastName: d.lastName, workPhone: d.workPhone, homePhone: d.homePhone, cellPhone: d.cellPhone, dateOfBirth: d.dateOfBirth },
                    { new: true, upsert: true }
                );
                const driverData = { person: contact._id, licenseNumber: d.licenseNumber, licenseState: d.licenseState, licenseStatus: d.licenseStatus };
                const driver = d._id ? await Driver.findByIdAndUpdate(d._id, driverData, { new: true }) : await Driver.create(driverData);
                driverIds.push(driver._id);
            }
        }

        let vehicleIds = [];
        if (vehicles && Array.isArray(vehicles)) {
            for (const v of vehicles) {
                const vehicle = v._id ? await Vehicle.findByIdAndUpdate(v._id, v, { new: true }) : await Vehicle.create(v);
                vehicleIds.push(vehicle._id);
            }
        }

        const updatedJob = await Job.findByIdAndUpdate(
            jobId, 
            { ...jobData, drivers: driverIds, vehicles: vehicleIds }, 
            { new: true }
        ).populate('account primaryInsured primaryAddress vehicles')
         .populate({ path: 'drivers', populate: { path: 'person' } })
         .populate({ path: 'lineCoverages', populate: { path: 'terms' } });

        if (!updatedJob) throw new Error("Job not found");
        res.status(200).json({ success: true, data: updatedJob });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });
        res.status(200).json({ success: true, message: "Job deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getJobDrivers = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).populate({ path: 'drivers', populate: { path: 'person' } });
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });
        res.status(200).json({
            success: true,
            count: job.drivers.length,
            data: job.drivers
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addOrUpdateDriver = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { 
            _id: driverId, 
            person,
            licenseNumber, licenseYear, licenseState, licenseStatus,
            numAccidents, numViolations, yearsOfExperience 
        } = req.body;

        let contactId;
        if (person && person.emailAddress) {
            const contact = await Contact.findOneAndUpdate(
                { emailAddress: person.emailAddress }, 
                { firstName: person.firstName, lastName: person.lastName, workPhone: person.workPhone, homePhone: person.homePhone, cellPhone: person.cellPhone, dateOfBirth: person.dateOfBirth },
                { new: true, upsert: true }
            );
            contactId = contact._id;
        } else if (typeof person === 'string') {
            contactId = person;
        } else {
            throw new Error("A valid person object with email or a person ID is required");
        }

        const driverData = { 
            person: contactId, 
            licenseNumber, licenseYear, licenseState, licenseStatus,
            numAccidents, numViolations, yearsOfExperience 
        };
        
        let driver = driverId ? await Driver.findByIdAndUpdate(driverId, driverData, { new: true }) : await Driver.create(driverData);
        await driver.populate('person');

        const job = await Job.findByIdAndUpdate(
            jobId, 
            { $addToSet: { drivers: driver._id } }, 
            { new: true }
        );

        if (!job) return res.status(404).json({ success: false, error: "Job not found" });
        res.status(201).json({ success: true, data: driver });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.removeDriver = async (req, res) => {
    try {
        const { jobId, driverId } = req.params;
        await Job.findByIdAndUpdate(jobId, { $pull: { drivers: driverId } });
        await Driver.findByIdAndDelete(driverId);
        res.status(200).json({ success: true, message: "Driver removed from job and deleted" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getJobVehicles = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).populate({
            path: 'vehicles',
            populate: { path: 'vehicleDrivers.driver', populate: { path: 'person' } }
        });
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });
        res.status(200).json({
            success: true,
            count: job.vehicles.length,
            data: job.vehicles
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addOrUpdateVehicle = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { vehicleId, ...vehicleData } = req.body;

        if (vehicleData.garageLocation && typeof vehicleData.garageLocation === 'object') {
            const newAddress = await Address.create(vehicleData.garageLocation); 
            vehicleData.garageLocation = newAddress._id;
        }

        let vehicle = vehicleId ? await Vehicle.findByIdAndUpdate(vehicleId, vehicleData, { new: true }) : await Vehicle.create(vehicleData);
        await vehicle.populate('garageLocation');

        const job = await Job.findByIdAndUpdate(
            jobId, 
            { $addToSet: { vehicles: vehicle._id } }, 
            { new: true }
        );

        if (!job) throw new Error("Job not found");
        res.status(201).json({ success: true, data: vehicle });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.removeVehicle = async (req, res) => {
    try {
        const { jobId, vehicleId } = req.params;
        await Job.findByIdAndUpdate(jobId, { $pull: { vehicles: vehicleId } });
        await Vehicle.findByIdAndDelete(vehicleId);
        res.status(200).json({ success: true, message: "Vehicle removed from job and deleted" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
