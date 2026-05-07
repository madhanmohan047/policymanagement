require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const basicAuth = require('./middleware/auth');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./config/swagger'); 

const accountRoutes = require('./routes/account.routes');
const jobRoutes = require('./routes/job.routes');
const adminRoutes = require('./routes/admin.routes');
const policyRoutes = require('./routes/policy.routes');
const typelistRoutes = require('./routes/typelistRoutes');

const app = express();

app.use(express.json());
app.use(basicAuth);

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/accounts', accountRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/typelists', typelistRoutes);

const PORT = process.env.PORT || 8180;

const startServer = async () => {
    try {
        await connectDB(); 
        console.log('MongoDB Atlas Connected');
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Database connection failed. Server not started.');
        console.error(err);
        process.exit(1); 
    }
};

startServer();
