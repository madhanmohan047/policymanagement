const mongoose = require('mongoose');

const dbUrl = process.env.MONGO_URI;

if (!dbUrl) {
    console.error('Database connection string is not defined. Please set MONGO_URI in your environment variables.');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err);
});

module.exports = connectDB;
