const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

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
 * /api/admin/organizations:
 *   get:
 *     summary: Get all organizations
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: List of organizations
 *   post:
 *     summary: Create an organization
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OrganizationInput' }
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/organizations', adminController.getAllOrganizations);
router.post('/organizations', adminController.createOrganization);

/**
 * @openapi
 * /api/admin/organizations/{id}:
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
 *         description: Success
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
 *           schema: { type: object, properties: { name: { type: string }, taxId: { type: string } } }
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.get('/organizations/:id', adminController.getOrganizationById);
router.put('/organizations/:id', adminController.updateOrganization);
router.delete('/organizations/:id', adminController.deleteOrganization);

// ==========================================
// 👥 GROUP ROUTES
// ==========================================

/**
 * @openapi
 * /api/admin/groups:
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
 *           schema: { $ref: '#/components/schemas/GroupInput' }
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/groups', adminController.getAllGroups);
router.post('/groups', adminController.createGroup);

/**
 * @openapi
 * /api/admin/groups/{id}:
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
 *         description: Success
 *   put:
 *     summary: Update group
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
 *           schema: { $ref: '#/components/schemas/GroupInput' }
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.get('/groups/:id', adminController.getGroupById);
router.put('/groups/:id', adminController.updateGroup);
router.delete('/groups/:id', adminController.deleteGroup);

// ==========================================
// 🏷️ PRODUCER CODE ROUTES
// ==========================================

/**
 * @openapi
 * /api/admin/producercodes:
 *   get:
 *     summary: Get all producer codes
 *     tags: [ProducerCodes]
 *     responses:
 *       200:
 *         description: List of producer codes
 *   post:
 *     summary: Create producer code
 *     tags: [ProducerCodes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProducerCodeInput' }
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/producercodes', adminController.getAllProducerCodes);
router.post('/producercodes', adminController.createProducerCode);

/**
 * @openapi
 * /api/admin/producercodes/{id}:
 *   put:
 *     summary: Update producer code
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
 *           schema: { $ref: '#/components/schemas/ProducerCodeInput' }
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete producer code
 *     tags: [ProducerCodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.put('/producercodes/:id', adminController.updateProducerCode);
router.delete('/producercodes/:id', adminController.deleteProducerCode);

// ==========================================
// 👤 USER ROUTES
// ==========================================

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *   post:
 *     summary: Create user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserInput' }
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserInput' }
 *     responses:
 *       200:
 *         description: Updated
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
 *         description: Deleted
 */
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;