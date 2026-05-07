const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Policy Center API',
      version: '1.0.0',
      description: 'API for managing Accounts, Jobs, Drivers, and Vehicles',
    },
    servers: [{ url: 'http://localhost:8180' }],
    components: {
      securitySchemes: {
        basicAuth: {
          type: 'http',
          scheme: 'basic',
        },
      },
      schemas: {
        // ==========================================
        // 🛠️ ENTITY SCHEMAS (The "Actual" Objects returned by API)
        // ==========================================
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            groups: { type: 'array', items: { type: 'string' } },
            producerCodes: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Organization: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            taxId: { type: 'string' },
            address: { $ref: '#/components/schemas/Address' },
            contact: { $ref: '#/components/schemas/Contact' }
          }
        },
        Contact: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            type: { $ref: '#/components/schemas/LookupObject' },
            roles: { type: 'array', items: { $ref: '#/components/schemas/LookupObject' } }
          }
        },
        Address: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            addressLine1: { type: 'string' },
            city: { type: 'string' },
            postalCode: { type: 'string' },
            state: { $ref: '#/components/schemas/LookupObject' },
            country: { $ref: '#/components/schemas/LookupObject' }
          }
        },
        ProducerCode: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            code: { type: 'string' },
            name: { type: 'string' },
            organization: { $ref: '#/components/schemas/Organization' }
          }
        },
        LookupObject: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            name: { type: 'string' }
          }
        },

        // ==========================================
        // 📥 INPUT SCHEMAS (What the API receives in requestBody)
        // ==========================================
        UserInput: {
          type: 'object',
          required: ['username', 'email'],
          properties: {
            username: { type: 'string' },
            email: { type: 'string' },
            groups: { type: 'array', items: { type: 'string' } },
            producerCodes: { type: 'array', items: { type: 'string' } }
          }
        },
        OrganizationInput: {
          type: 'object',
          required: ['name', 'address', 'contact'],
          properties: {
            name: { type: 'string' },
            taxId: { type: 'string' },
            address: { $ref: '#/components/schemas/AddressInput' },
            contact: { $ref: '#/components/schemas/ContactInput' }
          }
        },
        AddressInput: {
          type: 'object',
          required: ['addressLine1', 'city', 'postalCode', 'state', 'country'],
          properties: {
            addressLine1: { type: 'string' },
            city: { type: 'string' },
            postalCode: { type: 'string' },
            state: { type: 'object', properties: { code: { type: 'string' }, name: { type: 'string' } } },
            country: { type: 'object', properties: { code: { type: 'string' }, name: { type: 'string' } } }
          }
        },
        ContactInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'email'],
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' }
          }
        },
        GroupInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            organizations: { type: 'array', items: { type: 'string' } },
            producerCodes: { type: 'array', items: { type: 'string' } }
          }
        },
        ProducerCodeInput: {
          type: 'object',
          required: ['code', 'name', 'organizationId'],
          properties: {
            code: { type: 'string' },
            name: { type: 'string' },
            organizationId: { type: 'string' }
          }
        }
      }
    },
    security: [{ basicAuth: [] }]
  },
  apis: ['./app.js', './routes/*.js', './index.js'], 
};

module.exports = options;
