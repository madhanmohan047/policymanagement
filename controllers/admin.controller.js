const { Organization, Group, ProducerCode, User, Address, State, Country, Contact } = require('../models');

// Helper for Organization Population
const orgPopulate = [
    { path: 'address' },
    { path: 'contact' },
    { path: 'groups', select: 'name' },           
    { path: 'producerCodes', select: 'code name' } 
];

// ==========================================
// 🏢 ORGANIZATION LOGIC
// ==========================================

exports.getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find().populate(orgPopulate);
        res.json(organizations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getOrganizationById = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id).populate(orgPopulate);
        if (!organization) return res.status(404).json({ message: 'Organization not found' });
        res.json(organization);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createOrganization = async (req, res) => {
    const { address, contact, name, taxId } = req.body;
    let createdAddressId = null;
    let createdContactId = null;

    try {
        // 1. Validate Master Data
        const [stateDoc, countryDoc] = await Promise.all([
            State.findOne({ code: address.state?.code }),
            Country.findOne({ code: address.country?.code })
        ]);
        if (!stateDoc || !countryDoc) throw new Error('Invalid state or country code');

        // 2. Create Address
        const newAddress = new Address({
            ...address,
            state: { code: stateDoc.code, name: stateDoc.name },
            country: { code: countryDoc.code, name: countryDoc.name }
        });
        const savedAddress = await newAddress.save();
        createdAddressId = savedAddress._id;

        // 3. Create Contact
        const newContact = new Contact({ ...contact, createdBy: req.userContext?.id });
        const savedContact = await newContact.save();
        createdContactId = savedContact._id;

        // 4. Create Organization
        const organization = new Organization({
            name, taxId, address: createdAddressId, contact: createdContactId
        });
        const savedOrg = await organization.save();

        res.status(201).json(savedOrg);

    } catch (err) {
        if (createdAddressId) await Address.findByIdAndDelete(createdAddressId);
        if (createdContactId) await Contact.findByIdAndDelete(createdContactId);
        
        res.status(400).json({ message: err.message });
    }
};

exports.updateOrganization = async (req, res) => {
    try {
        let updateData = req.body;
        if (Array.isArray(updateData)) updateData = updateData[0];
        
        const updatedOrg = await Organization.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData }, 
            { new: true, runValidators: true }
        ).populate(orgPopulate);

        if (!updatedOrg) return res.status(404).json({ message: 'Organization not found' });
        res.json(updatedOrg);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteOrganization = async (req, res) => {
    try {
        const org = await Organization.findByIdAndDelete(req.params.id);
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        // Clean up references
        await Promise.all([
            Group.updateMany({ organizations: org._id }, { $pull: { organizations: org._id } }),
            ProducerCode.updateMany({ organizationId: org._id }, { organizationId: null })
        ]);

        res.json({ message: 'Organization and linked references deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// ==========================================
// 👥 GROUP LOGIC
// ==========================================

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find().populate('producerCodes organizations');
        res.json(groups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id).populate('producerCodes organizations');
        if (!group) return res.status(404).json({ message: 'Group not found' });
        res.json(group);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { name, organizations, producerCodes } = req.body;
        const group = new Group({ name, organizations, producerCodes });
        const savedGroup = await group.save();

        if (organizations) {
            await Organization.updateMany(
                { _id: { $in: organizations } },
                { $addToSet: { groups: savedGroup._id } }
            );
        }
        res.status(201).json(savedGroup);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const oldGroup = await Group.findById(req.params.id);
        if (!oldGroup) return res.status(404).json({ message: 'Group not found' });

        const updatedGroup = await Group.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        );

        if (req.body.organizations) {
            // Remove old organization links
            await Organization.updateMany({ _id: { $in: oldGroup.organizations } }, { $pull: { groups: oldGroup._id } });
            // Add new organization links
            await Organization.updateMany({ _id: { $in: req.body.organizations } }, { $addToSet: { groups: updatedGroup._id } });
        }

        res.json(updatedGroup);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findByIdAndDelete(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        await Organization.updateMany(
            { _id: { $in: group.organizations } },
            { $pull: { groups: group._id } }
        );

        res.json({ message: 'Group deleted and references cleaned' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// ==========================================
// 🏷️ PRODUCER CODE LOGIC
// ==========================================

exports.getAllProducerCodes = async (req, res) => {
    try {
        const codes = await ProducerCode.find().populate({ path: 'organization', select: 'name' });
        res.json(codes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createProducerCode = async (req, res) => {
    try {
        const producerCode = new ProducerCode(req.body);
        const saved = await producerCode.save();

        await Organization.findByIdAndUpdate(
            saved.organization, 
            { $addToSet: { producerCodes: saved._id } }
        );

        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateProducerCode = async (req, res) => {
    try {
        const oldProducer = await ProducerCode.findById(req.params.id);
        if (!oldProducer) return res.status(404).json({ message: 'Not found' });

        const updated = await ProducerCode.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (req.body.organization && req.body.organization !== oldProducer.organization) {
            await Organization.findByIdAndUpdate(oldProducer.organization, { $pull: { producerCodes: oldProducer._id } });
            await Organization.findByIdAndUpdate(updated.organization, { $addToSet: { producerCodes: updated._id } });
        }

        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteProducerCode = async (req, res) => {
    try {
        const producer = await ProducerCode.findByIdAndDelete(req.params.id);
        if (!producer) return res.status(404).json({ message: 'Not found' });

        await Promise.all([
            Organization.findByIdAndUpdate(producer.organization, { $pull: { producerCodes: producer._id } }),
            Group.updateMany({ producerCodes: producer._id }, { $pull: { producerCodes: producer._id } })
        ]);

        res.json({ message: 'ProducerCode deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// ==========================================
// 👤 USER LOGIC
// ==========================================

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('groups producerCodes');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
