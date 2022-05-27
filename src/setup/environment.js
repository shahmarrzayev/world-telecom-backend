require('dotenv').config();
const winston = require('winston');

const { Env } = require('../enums');
const { getFromEnv } = require('../utils/commonUtils');

const setupAndCheckEnvironment = () => {
    Object.values(Env).forEach(environmentVariable => {
        const value = getFromEnv(environmentVariable);
        if (!value) {
            winston.error(`Environment variable ${environmentVariable} is missing`);
            process.exit(1);
        }
    });
};

module.exports = setupAndCheckEnvironment;
