const mongoose = require('mongoose');

const { WTUserActivity } = require('../../enums');

const userActivitySchema = mongoose.Schema(
    {
        userEmail: {
            type: String,
            required: true,
        },
        userFirstName: {
            type: String,
            required: true,
        },
        activityType: {
            type: String,
            enum: Object.values(WTUserActivity),
        },
    },
    { timestamps: true }
);

const UserActivity = mongoose.model('userActivities', userActivitySchema);

module.exports = UserActivity;
