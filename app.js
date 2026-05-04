const express = require('express');
const connectDB = require('./config/db');
const basicAuth = require('./middleware/auth');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./config/swagger'); 

const accountRoutes = require('./routes/accountRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();


app.use(express.json());
app.use(basicAuth);


connectDB();


const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


app.use('/api/accounts', accountRoutes);
app.use('/api/jobs', jobRoutes);

const PORT = 8180;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));