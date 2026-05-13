const Activity = require('../models/Activity');
const User = require('../models/User');

exports.createActivity = async (req, res) => {
    try {
        const { accountId, assignedUserId, title, description } = req.body;

        const newActivity = new Activity({
            account: accountId,
            assignedUser: assignedUserId,
            title,
            description
        });

        await newActivity.save();
        return res.status(201).json({ success: true, data: newActivity });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.closeActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        const currentUserId = req.user._id; 

        const activity = await Activity.findById(activityId);

        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity not found' });
        }
        
        if (activity.assignedUser !== currentUserId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Permission Denied: You are not the user assigned to this activity.' 
            });
        }
        
        activity.status = 'Closed';
        activity.closedBy = currentUserId;
        activity.closedAt = new Date();

        await activity.save();

        return res.status(200).json({ 
            success: true, 
            message: 'Activity closed successfully', 
            data: activity 
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
