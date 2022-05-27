const winston = require('winston');

const { initCache } = require('../utils/cacheUtils');

const initializeCache = () => {
    try {
        initCache();
    } catch (error) {
        winston.error(`Could not initiate cache -- ${JSON.stringify(error)}`);
        process.exit(1);
    }
};

module.exports = initializeCache;
