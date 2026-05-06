const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { Organization, Group, ProducerCode, User, Address, State, Country, Contact } = require('../models');

/**
 * @openapi
 * components:
 *   schemas:
 *     AddressInput:
 *       type: object
 *       required: [addressLine1, city, postalCode, state, country]
 *       properties:
 *         addressLine1: { type: string }
 *         city: { type: string }
 *         postalCode: { type: string }
 *         state:
 *           type: object
 *           properties:
 *             code: { type: string, example: 'NY' }
 *             name: { type: string, example: 'New York' }
 *         country:
 *           type: object
 *           properties:
 *             code: { type: string, example: 'US' }
 *             name: { type: string, example: 'United States' }
 * 
 *     ContactInput:
 *       type: object
 *       required: [firstName, lastName, email]
 *       properties:
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         email: { type: string }
 *         phone: { type: string }
 *         type:
 *           type: object
 *           properties:
 *             code: { type: string }
 *             name: { type: string }
 *         roles:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               code: { type: string }
 *               name: { type: string }
 * 
 *     OrganizationInput:
 *       type: object
 *       required: [name, address, contact]
 *       properties:
 *         name: { type: string }
 *         taxId: { type: string }
 *         address: { $ref: '#/components/schemas/AddressInput' }
 *         contact: { $ref: '#/components/schemas/ContactInput' }
 * 
 *     GroupInput:
 *       type: object
 *       required: [name]
 *       properties:
 *         name: { type: string }
 *         organizations: { type: array, items: { type: string }, description: 'Array of Organization IDs' }
 *         producerCodes: { type: array, items: { type: string }, description: 'Array of ProducerCode IDs' }
 * 
 *     ProducerCodeInput:
 *       type: object
 *       required: [code, name, organizationId]
 *       properties:
 *         code: { type: string }
 *         name: { type: string }
 *         organizationId: { type: string }
 * 
 *     UserInput:
 *       type: object
 *       required: [username, email]
 *       properties:
 *         username: { type: string }
 *         email: { type: string }
 *         groups: { type: array, items: { type: string } }
 *         producerCodes: { type: array, items: { type: string } }
 */

// ==========================================
// 🏢 ORGANIZATION ROUTES
// ==========================================

/**
 * @openapi
 * /api/organizations:
 *   get:
 *     summary: Get all organizations
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: List of organizations
 *   post:
 *     summary: Create an organization with address and contact
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizationInput'
 *     responses:
 *       201:
 *         description: Organization created
 *       400:
 *         description: Invalid input or master data missing
 */
router.get('/organizations', async (req, res) => {
    try {
        const organizations = await Organization.find();
        await Promise.all(organizations.map(async (org) => {
            await org.populate([
                { path: 'address' },
                { path: 'contact' },
                { path: 'groups', select: 'name' },           
                { path: 'producerCodes', select: 'code name' } 
            ]);
        }));
        res.json(organizations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @openapi
 * /api/organizations/{id}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Organization details
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               taxId: { type: string }
 *     responses:
 *       200:
 *         description: Updated successfully
 *   delete:
 *     summary: Delete organization and clean references
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.get('/organizations/:id', async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);
        if (!organization) return res.status(404).json({ message: 'Organization not found' });
        await organization.populate([
            { path: 'address' },
            { path: 'contact' },
            { path: 'groups', select: 'name' },           
            { path: 'producerCodes', select: 'code name' } 
        ]);
        if (!organization) return res.status(404).json({ message: 'Organization not found' });
        res.json(organization);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/organizations', async (req, res) => {
    const { address, contact, name, taxId } = req.body;

    let createdAddressId = null;
    let createdContactId = null;

    try {
        
        const [stateDoc, countryDoc] = await Promise.all([
            State.findOne({ code: address.state?.code }),
            Country.findOne({ code: address.country?.code })
        ]);
        if (!stateDoc || !countryDoc) throw new Error('Invalid state or country code');

        const newAddress = new Address({
            ...address,
            state: { code: stateDoc.code, name: stateDoc.name },
            country: { code: countryDoc.code, name: countryDoc.name }
        });
        await newAddress.save();
        createdAddressId = newAddress._id;

        const newContact = new Contact({ ...contact, createdBy: req.userContext?.id });
        await newContact.save();
        createdContactId = newContact._id;

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
});

router.put('/organizations/:id', async (req, res) => {
    try {
        
        let updateData = req.body;
        if (Array.isArray(updateData)) {
            updateData = updateData[0];
        }
        
        const updatedOrg = await Organization.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData }, 
            { new: true, runValidators: true }
        );

        if (!updatedOrg) return res.status(404).json({ message: 'Organization not found' });

        await updatedOrg.populate([
            { path: 'address' },
            { path: 'contact' },
            { path: 'groups', select: 'name' },           
            { path: 'producerCodes', select: 'code name' } 
        ]);

        res.json(updatedOrg);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.delete('/organizations/:id', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const org = await Organization.findByIdAndDelete(req.params.id).session(session);
        if (!org) throw new Error('Organization not found');

        await Group.updateMany(
            { organizations: org._id },
            { $pull: { organizations: org._id } },
            { session }
        );
      
        await ProducerCode.updateMany(
            { organizationId: org._id },
            { organizationId: null }, 
            { session }
        );

        await session.commitTransaction();
        res.json({ message: 'Organization and all linked references deleted' });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

// ==========================================
// 👥 GROUP ROUTES
// ==========================================

/**
 * @openapi
 * /api/groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: List of groups
 *   post:
 *     summary: Create a group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupInput'
 *     responses:
 *       201:
 *         description: Group created
 */
router.get('/groups', async (req, res) => {
    try {
        const groups = await Group.find().populate('producerCodes organizations');
        res.json(groups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @openapi
 * /api/groups/{id}:
 *   get:
 *     summary: Get group by ID
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Group details
 *   put:
 *     summary: Update group and sync organizations
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupInput'
 *     responses:
 *       200:
 *         description: Updated successfully
 *   delete:
 *     summary: Delete group and clean org references
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.get('/groups/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id).populate('producerCodes organizations');
        if (!group) return res.status(404).json({ message: 'Group not found' });
        res.json(group);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/groups', async (req, res) => {
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
});

router.put('/groups/:id', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const oldGroup = await Group.findById(req.params.id).session(session);
        if (!oldGroup) throw new Error('Group not found');

        const updatedGroup = await Group.findByIdAndUpdate(
            req.params.id, req.body, { new: true, session }
        );

        if (req.body.organizations) {
            await Organization.updateMany({ _id: { $in: oldGroup.organizations } }, { $pull: { groups: oldGroup._id } }, { session });
            await Organization.updateMany({ _id: { $in: req.body.organizations } }, { $addToSet: { groups: updatedGroup._id } }, { session });
        }

        await session.commitTransaction();
        res.json(updatedGroup);
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

router.delete('/groups/:id', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const group = await Group.findByIdAndDelete(req.params.id).session(session);
        if (!group) throw new Error('Group not found');

        await Organization.updateMany(
            { _id: { $in: group.organizations } },
            { $pull: { groups: group._id } },
            { session }
        );

        await session.commitTransaction();
        res.json({ message: 'Group deleted and references cleaned' });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

/**
 * @openapi
 * /api/producercodes:
 *   get:
 *     summary: Get all producer codes
 *     tags: [ProducerCodes]
 *     responses:
 *       200:
 *         description: List of producer codes
 *   post:
 *     summary: Create producer code and link to organization
 *     tags: [ProducerCodes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProducerCodeInput'
 *     responses:
 *       201:
 *         description: Created successfully
 */
router.get('/producercodes', async (req, res) => {
    try {
        const codes = await ProducerCode.find().populate({
            path: 'organization', 
            select: 'name'
        });
        res.json(codes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/producercodes', async (req, res) => {
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
});

/**
 * @openapi
 * /api/producercodes/{id}:
 *   put:
 *     summary: Update producer code and sync organization
 *     tags: [ProducerCodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProducerCodeInput'
 *     responses:
 *       200:
 *         description: Updated successfully
 *   delete:
 *     summary: Delete producer code and clean references
 *     tags: [ProducerCodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.put('/producercodes/:id', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const oldProducer = await ProducerCode.findById(req.params.id).session(session);
        const updated = await ProducerCode.findByIdAndUpdate(req.params.id, req.body, { new: true, session });

        if (req.body.organization && req.body.organization !== oldProducer.organization) {
            await Organization.findByIdAndUpdate(oldProducer.organization, { $pull: { producerCodes: oldProducer._id } }, { session });
            await Organization.findByIdAndUpdate(updated.organization, { $addToSet: { producerCodes: updated._id } }, { session });
        }

        await session.commitTransaction();
        res.json(updated);
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

router.delete('/producercodes/:id', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const producer = await ProducerCode.findByIdAndDelete(req.params.id).session(session);
        if (!producer) throw new Error('Not found');

        await Organization.findByIdAndUpdate(producer.organization, { $pull: { producerCodes: producer._id } }, { session });
        await Group.updateMany({ producerCodes: producer._id }, { $pull: { producerCodes: producer._id } }, { session });

        await session.commitTransaction();
        res.json({ message: 'ProducerCode deleted' });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

// ==========================================
// 👤 USER ROUTES
// ==========================================

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *   post:
 *     summary: Create a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User created
 */
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().populate('groups producerCodes');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated successfully
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
