const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

/**
 * @openapi
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         taxId: { type: string }
 *         address: { $ref: '#/components/schemas/Address' }
 *         contact: { $ref: '#/components/schemas/Contact' }
 *         groups: { type: array, items: { type: object, properties: { name: { type: string } } } }
 *         producerCodes: { type: array, items: { type: object, properties: { code: { type: string }, name: { type: string } } } }
 * 
 *     Group:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         organizations: { type: array, items: { $ref: '#/components/schemas/Organization' } }
 *         producerCodes: { type: array, items: { $ref: '#/components/schemas/ProducerCode' } }
 * 
 *     ProducerCode:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         code: { type: string }
 *         name: { type: string }
 *         organization: { $ref: '#/components/schemas/Organization' }
 */

/**
 * @openapi
 * /api/admin/organizations:
 *   get:
 *     summary: Get all organizations
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: List of organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Organization' }
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
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Organization' }
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

/**
 * @openapi
 * /api/admin/groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: List of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Group' }
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
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Group' }
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

/**
 * @openapi
 * /api/admin/producercodes:
 *   get:
 *     summary: Get all producer codes
 *     tags: [ProducerCodes]
 *     responses:
 *       200:
 *         description: List of producer codes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/ProducerCode' }
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

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
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
 */
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

/**
 * @openapi
 * /api/admin/user:
 *   get:
 *     summary: Get user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/User' }
 */
router.get('/user', adminController.getUser);

module.exports = router;
