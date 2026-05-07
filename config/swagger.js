const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Policy Center API',
      version: '1.0.0',
      description: 'Comprehensive API for managing Insurance Policy Life Cycle',
    },
    servers: [{ url: 'http://localhost:8180' }],
    components: {
      securitySchemes: {
        basicAuth: { type: 'http', scheme: 'basic' },
      },
      schemas: {
        // ==========================================
        // 🛠️ BASE / PRIMITIVE SCHEMAS (The "Actual" Schemas)
        // ==========================================
        LookupObject: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'ACT' },
            name: { type: 'string', example: 'Active' }
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
        ProducerCode: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            code: { type: 'string' },
            name: { type: 'string' },
            organization: { $ref: '#/components/schemas/Organization' }
          }
        },
        Account: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            accountNumber: { type: 'string' },
            accountHolder: { $ref: '#/components/schemas/Contact' },
            primaryLocation: { $ref: '#/components/schemas/Address' },
            status: { $ref: '#/components/schemas/LookupObject' },
            organization: { $ref: '#/components/schemas/Organization' },
            producerCode: { $ref: '#/components/schemas/ProducerCode' },
            createdBy: { type: 'string' }
          }
        },
        Vehicle: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            make: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'integer' },
            vin: { type: 'string' }
          }
        },
        Driver: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            contact: { $ref: '#/components/schemas/Contact' },
            licenseNumber: { type: 'string' },
            licenseState: { type: 'string' },
            licenseStatus: { type: 'string' }
          }
        },

        // ==========================================
        // 📥 INPUT SCHEMAS (What the API receives)
        // ==========================================
        // Note: These use strings for IDs because that's what the body contains
        
        OrganizationInput: {
          type: 'object',
          required: ['name', 'address', 'contact'],
          properties: {
            name: { type: 'string' },
            taxId: { type: 'string' },
            address: { 
                type: 'object', 
                properties: { 
                    addressLine1: { type: 'string' }, 
                    city: { type: 'string' }, 
                    postalCode: { type: 'string' },
                    state: { $ref: '#/components/schemas/LookupObject' },
                    country: { $ref: '#/components/schemas/LookupObject' }
                } 
            },
            contact: { 
                type: 'object', 
                properties: { 
                    firstName: { type: 'string' }, 
                    lastName: { type: 'string' }, 
                    email: { type: 'string' } 
                } 
            }
          }
        },
        AccountInput: {
          type: 'object',
          required: ['accountHolder', 'primaryLocation', 'organization', 'producerCode', 'status'],
          properties: {
            accountNumber: { type: 'string' },
            accountHolder: { type: 'string', description: 'Contact ID' },
            primaryLocation: { type: 'string', description: 'Address ID' },
            status: { $ref: '#/components/schemas/LookupObject' },
            organization: { type: 'string', description: 'Organization ID' },
            producerCode: { type: 'string', description: 'ProducerCode ID' },
            createdBy: { type: 'string', description: 'User ID' }
          }
        },
        JobPayload: {
          type: 'object',
          properties: {
            jobNumber: { type: 'string' },
            jobStatus: { $ref: '#/components/schemas/LookupObject' },
            jobType: { $ref: '#/components/schemas/LookupObject' },
            organization: { type: 'string', description: 'Organization ID' },
            producerCode: { type: 'string', description: 'ProducerCode ID' },
            drivers: { 
              type: 'array', 
              items: { 
                type: 'object', 
                properties: { 
                    _id: { type: 'string' }, 
                    firstName: { type: 'string' }, 
                    email: { type: 'string' },
                    licenseNumber: { type: 'string' }
                } 
              } 
            },
            vehicles: { 
              type: 'array', 
              items: { 
                type: 'object', 
                properties: { 
                    _id: { type: 'string' }, 
                    make: { type: 'string' }, 
                    vin: { type: 'string' } 
                } 
              } 
            }
          }
        }
      }
    },
    security: [{ basicAuth: [] }]
  },
  apis: ['./app.js', './routes/*.js', './index.js'], 
};

module.exports = options;
