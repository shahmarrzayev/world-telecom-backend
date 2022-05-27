const winston = require('winston');

const { GeneralException } = require('../exceptions');
const { countUserActivity, findUserActivity, saveUserActivity } = require('../repository/userActivityRepository');

const getUserActivities = async requestQuery => {
    if (!requestQuery) {
        winston.warn('userActivityService.getUserActivities -- null param');
        throw new GeneralException();
    }

    const { activities, query } = await findUserActivity(requestQuery);
    if (!activities) {
        winston.warn('userActivityService.recordUserActivity -- could not get activities');
        throw new GeneralException();
    }

    const total = await countUserActivity(query);
    if (total !== 0 && !total) {
        winston.warn('numberService.getManyNumbers -- could not count numbers');
        throw new GeneralException();
    }
    return {
        activities,
        limit: parseInt(requestQuery.limit, 10) || 20,
        page: parseInt(requestQuery.page, 10) || 1,
        total,
    };
};

const recordUserActivity = async (userEntity, activityType, transaction) => {
    if (!userEntity || !activityType) {
        winston.warn('userActivityService.recordUserActivity -- null param');
        throw new GeneralException();
    }

    const userActivityEntity = await saveUserActivity(
        {
            userEmail: userEntity.email,
            userFirstName: userEntity.firstName,
            activityType,
        },
        transaction
    );
    if (!userActivityEntity) {
        winston.warn('userActivityService.recordUserActivity -- could not save activity');
        throw new GeneralException();
    }
};

module.exports = {
    getUserActivities,
    recordUserActivity,
};
