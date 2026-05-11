const { Organization, Group, ProducerCode, User, Address, State, Country, Contact } = require('../models');

const orgPopulate = [
    { path: 'address' },
    { path: 'contact' },
    { path: 'groups', select: 'name' },           
    { path: 'producerCodes', select: 'code name' } 
];

exports.getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find().populate(orgPopulate);
        res.status(200).json({
            success: true,
            count: organizations.length,
            data: organizations
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getOrganizationById = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id).populate(orgPopulate);
        if (!organization) return res.status(404).json({ success: false, message: 'Organization not found' });
        
        res.status(200).json({ success: true, data: organization });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createOrganization = async (req, res) => {
    const { address, contact, name, taxId } = req.body;
    let createdAddressId = null;
    let createdContactId = null;

    try {
        const [stateDoc, countryDoc] = await Promise.all([
            State.findOne({ code: address?.state?.code }),
            Country.findOne({ code: address?.country?.code })
        ]);
        if (!stateDoc || !countryDoc) throw new Error('Invalid state or country code');

        const newAddress = new Address({
            ...address,
            state: { code: stateDoc.code, name: stateDoc.name },
            country: { code: countryDoc.code, name: countryDoc.name }
        });
        const savedAddress = await newAddress.save();
        createdAddressId = savedAddress._id;

        const newContact = new Contact({ ...contact, createdBy: req.userContext?.id });
        const savedContact = await newContact.save();
        createdContactId = savedContact._id;

        const organization = new Organization({
            name, taxId, address: createdAddressId, contact: createdContactId
        });
        const savedOrg = await organization.save();
        
        const populatedOrg = await Organization.findById(savedOrg._id).populate(orgPopulate);

        res.status(201).json({ success: true, data: populatedOrg });
    } catch (err) {
        if (createdAddressId) await Address.findByIdAndDelete(createdAddressId);
        if (createdContactId) await Contact.findByIdAndDelete(createdContactId);
        res.status(400).json({ success: false, message: err.message });
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

        if (!updatedOrg) return res.status(404).json({ success: false, message: 'Organization not found' });
        
        res.status(200).json({ success: true, data: updatedOrg });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteOrganization = async (req, res) => {
    try {
        const org = await Organization.findByIdAndDelete(req.params.id);
        if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

        await Promise.all([
            Group.updateMany({ organizations: org._id }, { $pull: { organizations: org._id } }),
            ProducerCode.updateMany({ organization: org._id }, { organization: null })
        ]);

        res.status(200).json({ success: true, message: 'Organization and linked references deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find().populate('producerCodes organizations');
        res.status(200).json({
            success: true,
            count: groups.length,
            data: groups
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id).populate('producerCodes organizations');
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        
        res.status(200).json({ success: true, data: group });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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
        
        const populatedGroup = await Group.findById(savedGroup._id).populate('producerCodes organizations');
        res.status(201).json({ success: true, data: populatedGroup });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const oldGroup = await Group.findById(req.params.id);
        if (!oldGroup) return res.status(404).json({ success: false, message: 'Group not found' });

        const updatedGroup = await Group.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        ).populate('producerCodes organizations');

        if (req.body.organizations) {
            await Organization.updateMany({ _id: { $in: oldGroup.organizations } }, { $pull: { groups: oldGroup._id } });
            await Organization.updateMany({ _id: { $in: req.body.organizations } }, { $addToSet: { groups: updatedGroup._id } });
        }

        res.status(200).json({ success: true, data: updatedGroup });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findByIdAndDelete(req.params.id);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

        await Organization.updateMany(
            { _id: { $in: group.organizations } },
            { $pull: { groups: group._id } }
        );

        res.status(200).json({ success: true, message: 'Group deleted and references cleaned' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getAllProducerCodes = async (req, res) => {
    try {
        const codes = await ProducerCode.find().populate({ path: 'organization', select: 'name' });
        res.status(200).json({
            success: true,
            count: codes.length,
            data: codes
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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

        const populatedCode = await ProducerCode.findById(saved._id).populate({ path: 'organization', select: 'name' });
        res.status(201).json({ success: true, data: populatedCode });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateProducerCode = async (req, res) => {
    try {
        const oldProducer = await ProducerCode.findById(req.params.id);
        if (!oldProducer) return res.status(404).json({ success: false, message: 'Not found' });

        const updated = await ProducerCode.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        ).populate({ path: 'organization', select: 'name' });

        if (req.body.organization && req.body.organization !== oldProducer.organization) {
            await Organization.findByIdAndUpdate(oldProducer.organization, { $pull: { producerCodes: oldProducer._id } });
            await Organization.findByIdAndUpdate(updated.organization, { $addToSet: { producerCodes: updated._id } });
        }

        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteProducerCode = async (req, res) => {
    try {
        const producer = await ProducerCode.findByIdAndDelete(req.params.id);
        if (!producer) return res.status(404).json({ success: false, message: 'Not found' });

        await Promise.all([
            Organization.findByIdAndUpdate(producer.organization, { $pull: { producerCodes: producer._id } }),
            Group.updateMany({ producerCodes: producer._id }, { $pull: { producerCodes: producer._id } })
        ]);

        res.status(200).json({ success: true, message: 'ProducerCode deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('groups producerCodes');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const populatedUser = await User.findById(user._id).populate('groups producerCodes');
        res.status(201).json({ success: true, data: populatedUser });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        ).populate('groups producerCodes');
        
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
