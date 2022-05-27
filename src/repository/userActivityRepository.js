const winston = require('winston');

const { getPaginationDetails, runQuery } = require('./helper/repositoryHelper');
const { getQueryForUserActivity } = require('./helper/userActivityRepositoryHelper');
const UserActivity = require('./models/userActivityModel');

const countUserActivity = async (query, transaction) => {
    winston.debug('userActivityRepository.countUserActivity -- start');
    const count = await runQuery(() => UserActivity.countDocuments(query).session(transaction));
    winston.debug('userActivityRepository.countUserActivity -- success');
    return count;
};

const findUserActivity = async (filters, transaction) => {
    winston.debug('userActivityRepository.findUserActivity -- start');
    const { skip } = getPaginationDetails(filters);
    const query = getQueryForUserActivity(filters);
    if (!query) return null;

    const activities = await runQuery(() =>
        UserActivity.find(query)
            .limit(parseInt(filters.limit, 10))
            .sort({ createdAt: -1 })
            .skip(skip)
            .session(transaction)
    );
    winston.debug('userActivityRepository.findUserActivity -- success');
    return { activities, query };
};

const saveUserActivity = async (activity, transaction) => {
    winston.debug('userActivityRepository.saveUserActivity -- start');
    if (!activity) {
        winston.warn('userActivityRepository.saveUserActivity -- null param');
        return null;
    }
    const dbActivity = new UserActivity(activity);
    const userActivityEntity = await runQuery(() => dbActivity.save({ session: transaction }));
    winston.debug('userActivityRepository.saveUserActivity -- success');
    return userActivityEntity;
};

module.exports = {
    countUserActivity,
    findUserActivity,
    saveUserActivity,
};
