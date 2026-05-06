const mongoose = require('mongoose');

const dbUrl = process.env.MONGO_URI;

if(!dbUrl) {
    console.error('Database connection string is not defined. Please set MONGO_URI in your environment variables.');
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