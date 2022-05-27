const { isValidDate } = require('../../utils/commonUtils');

const validateGetUserActivities = requestQuery => {
    if (!requestQuery) return null;

    if ((requestQuery.from && !isValidDate(requestQuery.from)) || (requestQuery.to && !isValidDate(requestQuery.to)))
        return 'Invalid date';

    return null;
};

module.exports = {
    validateGetUserActivities,
};
