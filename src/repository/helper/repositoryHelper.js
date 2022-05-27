const winston = require('winston');

const getPaginationDetails = ({ limit, page } = {}) => {
    winston.debug('repositoryHelper.getPaginationDetails -- start');
    if (!limit || !page) {
        return { limit: 10, page: 1 };
    }
    let skip = limit * (page - 1);
    skip = skip < 0 ? 0 : skip;
    winston.debug('repositoryHelper.getPaginationDetails -- success');
    return {
        limit: skip + limit,
        skip,
    };
};

const runQuery = async query => {
    if (!query || typeof query !== 'function') {
        winston.warn('repositoryHelper.runQuery -- wrong param');
        return null;
    }

    let result = null;
    try {
        result = await query();
    } catch (error) {
        winston.error(`repositoryHelper.runQuery -- ${JSON.stringify(error)}`);
        return null;
    }
    return result;
};

module.exports = {
    getPaginationDetails,
    runQuery,
};
