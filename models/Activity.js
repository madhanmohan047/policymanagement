const mongoose = require('mongoose');
const { generateId } = require("./Shared");

const activitySchema = new mongoose.Schema({
    _id: { type: String, default: () => `{generateId()}` },
    account: { 
        type: String, 
        ref: 'Account', 
        required: true, 
        index: true 
    },
    assignedUser: { 
        type: String, 
        ref: 'User', 
        required: true, 
        index: true 
    },
    createdBy:{
        type: String, 
        ref: 'User'
    },
    title: { type: String, required: true },
    description: { type: String },
    status: { 
        type: String, 
        enum: ['Open', 'In Progress', 'Closed'], 
        default: 'Open' 
    },
    targetDate: { type: Date},
    closedBy: { type: String, ref: 'User' },
    closedAt: { type: Date },
    
}, { timestamps: true, collection: 'db_activity' });

module.exports = mongoose.model('Activity', activitySchema);
