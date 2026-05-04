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
        SubmissionInput: {
          type: 'object',
          required: ['lobCode'],
          properties: {
            lobCode: { type: 'string', example: 'PA', description: 'Line of Business code' }
          }
        },
        DriverInput: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Optional: Include to update existing driver' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            phone: { type: 'string', example: '555-0199' },
            licenseNumber: { type: 'string', example: 'ABC12345' },
            licenseState: { type: 'string', example: 'NY' },
            licenseStatus: { type: 'string', example: 'Valid' }
          }
        },
        VehicleInput: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Optional' },
            make: { type: 'string', example: 'Toyota' },
            model: { type: 'string', example: 'Camry' },
            year: { type: 'integer', example: 2024 },
            vin: { type: 'string', example: '1NX...'}
          }
        },
        JobPayload: {
          type: 'object',
          properties: {
            jobType: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'submission' },
                name: { type: 'string', example: 'New Business' }
              }
            },
            drivers: {
              type: 'array',
              items: { $ref: '#/components/schemas/DriverInput' }
            },
            vehicles: {
              type: 'array',
              items: { $ref: '#/components/schemas/VehicleInput' }
            }
          }
        },
        AccountInput: {
          type: 'object',
          properties: {
            accountHolder: {
              type: 'object',
              properties: {
                firstName: { type: 'string', example: 'Jane' },
                lastName: { type: 'string', example: 'Smith' },
                email: { type: 'string', example: 'jane.smith@example.com' }
              }
            },
            primaryLocation: {
              type: 'object',
              properties: {
                addressLine1: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                postalCode: { type: 'string', example: '10001' }
              }
            },
            producerCode: { type: 'string', example: 'PROD001' },
            type: { type: 'string', example: 'Personal' },
            organization: { type: 'string', example: 'Dunder Mifflin' }
          }
        }
      }
    },
    security: [{ basicAuth: [] }]
  },
  apis: ['./app.js', './routes/*.js', './index.js'], 
};

module.exports = options