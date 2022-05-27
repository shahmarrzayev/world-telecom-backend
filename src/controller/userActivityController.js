const winston = require('winston');

const { validateGetUserActivities } = require('./validator/userActivityValidator');
const { BadRequestException } = require('../exceptions');
const { getUserActivities } = require('../service/userActivityService');

const getUserActivitiesController = async (req, res) => {
    winston.debug('userActivityController.getUserActivities -- start');
    const error = validateGetUserActivities(req.query);
    if (error) {
        winston.warn(`bannerController.addNewBanner -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }

    const activities = await getUserActivities(req.query);
    winston.debug('userActivityController.getUserActivities -- success');
    return res.send(activities);
};

module.exports = {
    getUserActivitiesController,
};
