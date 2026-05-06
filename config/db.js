const mongoose = require('mongoose');

const dbUrl = process.env.NODE_ENV === 'production' ? process.env.CLOUD_MONGO_URI : process.env.MONGO_URI;

if(!dbUrl) {
    console.error('Database connection string is not defined. Please set MONGO_URI or CLOUD_MONGO_URI in your environment variables.');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;