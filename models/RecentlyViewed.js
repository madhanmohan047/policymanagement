const mongoose = require('mongoose');

const RecentlyViewedSchema = new mongoose.Schema({
    user: { 
        type: String, 
        ref: 'User', 
        required: true
    },
    accounts: [{
        account: { 
            type: String, 
            ref: 'Account', 
            required: true 
        },
        viewedOn: { 
            type: Date, 
            default: Date.now 
        }
    }],
    policies: [{
        policy: { 
            type: String, 
            ref: 'Policy', 
            required: true 
        },
        viewedOn: { 
            type: Date, 
            default: Date.now 
        }
    }]
}, { 
    timestamps: true, collection: 'db_recentlyviewed'
});

module.exports = mongoose.model('RecentlyViewed', RecentlyViewedSchema);
