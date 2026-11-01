require('express-async-errors');
const express = require('express');
const winston = require('winston');

const { Env } = require('./enums');
const configureCors = require('./setup/cors');
const setupCache = require('./setup/cache');
const setupDbConnection = require('./setup/db');
const setupAndCheckEnvironment = require('./setup/environment');
const configureLogger = require('./setup/logger');
const setupRoutes = require('./setup/routes');
const { getFromEnv } = require('./utils/commonUtils');

process.on('uncaughtException', err => {
    winston.error(`Uncaught exception: ${err}`);
    process.exit(1);
});
process.on('unhandledRejection', (reason, p) => {
    winston.error(`Unhandled rejection: ${reason}, ${p}`);
    process.exit(1);
});

setupAndCheckEnvironment();
configureLogger();

const app = express();

configureCors(app);
setupRoutes(app);

setupDbConnection()
    .then(() => {
        setupCache();

        const port = getFromEnv(Env.PORT) || 3000;
        app.listen(port, () => winston.info(`Listening on port ${port}...`));
    })
    .catch(() => process.exit(1));
