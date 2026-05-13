require('dotenv').config();
const PORT = process.env.PORT || 8180;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Policy Center API',
      version: '1.0.0',
      description: 'API for managing Accounts, Jobs, Drivers, and Vehicles',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        basicAuth: {
          type: 'http',
          scheme: 'basic'
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
      },
      schemas: {
        LookupObject: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            name: { type: 'string' }
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
            emailAddress: { type: 'string' },
            workPhone: { type: 'string' },
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
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            emailAddress: { type: 'string' },
            groups: { type: 'array', items: { type: 'string' } },
            producerCodes: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Activity: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: 'act:12345' },
            account: { type: 'string', example: 'pc:8f98e8e7' },
            assignedUser: { type: 'string', example: 'pc:user123' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['Open', 'In Progress', 'Closed'] },
            closedBy: { type: 'string' },
            closedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ActivityInput: {
          type: 'object',
          required: ['accountId', 'assignedUserId', 'title'],
          properties: {
            accountId: { type: 'string', example: 'pc:8f98e8e7' },
            assignedUserId: { type: 'string', example: 'pc:user123' },
            title: { type: 'string', example: 'Client Follow-up' },
            description: { type: 'string', example: 'Discuss policy renewal terms' }
          }
        },
        AddressInput: {
          type: 'object',
          required: ['addressLine1', 'city', 'postalCode', 'state', 'country'],
          properties: {
            addressLine1: { type: 'string' },
            city: { type: 'string' },
            postalCode: { type: 'string' },
            state: { $ref: '#/components/schemas/LookupObject' },
            country: { $ref: '#/components/schemas/LookupObject' }
          }
        },
        ContactInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'emailAddress'],
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            emailAddress: { type: 'string' },
            workPhone: { type: 'string' },
            homePhone: { type: 'string' },
            cellPhone: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            type: { $ref: '#/components/schemas/LookupObject' },
            roles: { type: 'array', items: { $ref: '#/components/schemas/LookupObject' } } 
          }
        },
        DriverInput: {
          type: 'object',
          required: ['person', 'licenseNumber', 'licenseYear', 'licenseState'],
          properties: {
            person: { type: 'string', description: 'Contact ID' },
            licenseNumber: { type: 'string' },
            licenseYear: { type: 'integer' },
            licenseState: { type: 'string', description: 'State ID' },
            licenseStatus: { type: 'string' },
            numAccidents: { type: 'integer' },
            numViolations: { type: 'integer' },
            yearsOfExperience: { type: 'integer' }
          }
        },
        VehicleInput: {
          type: 'object',
          required: ['make', 'model', 'year', 'vin', 'bodyType', 'licenseState'],
          properties: {
            _id: { type: 'string', description: 'Optional: Update existing' },
            make: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'integer' },
            vin: { type: 'string' },
            color: { type: 'string' },
            costNew: { type: 'number' },
            annualMileage: { type: 'integer' },
            licensePlate: { type: 'string' },
            bodyType: { $ref: '#/components/schemas/LookupObject' },
            licenseState: { $ref: '#/components/schemas/LookupObject' },
            garageLocation: { 
              oneOf: [
                { $ref: '#/components/schemas/AddressInput' },
                { type: 'string', description: 'Address ID' }
              ]
            },
            vehicleDrivers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  driver: { type: 'string', description: 'Driver ID' },
                  yearsOfExperience: { type: 'integer' },
                  isPrimary: { type: 'boolean' }
                }
              }
            }
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
        UserInput: {
          type: 'object',
          required: ['username', 'emailAddress'],
          properties: {
            username: { type: 'string' },
            emailAddress: { type: 'string' },
            groups: { type: 'array', items: { type: 'string' } },
            producerCodes: { type: 'array', items: { type: 'string' } }
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
          required: ['code', 'name', 'organization'],
          properties: {
            code: { type: 'string' },
            name: { type: 'string' },
            organization: { type: 'string', description: 'Organization ID' }
          }
        }
      }
    },
    security: [{ basicAuth: [] }]
  },
  apis: ['./app.js', './routes/*.js', './index.js'], 
};

module.exports = options;
