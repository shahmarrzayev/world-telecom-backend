const appRoot = require('app-root-path');
const winston = require('winston');

const { Env } = require('../enums');
const { getFromEnv } = require('../utils/commonUtils');

const configureLogger = () => {
    const myFormat = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.json(),
        winston.format.printf(info => {
            return JSON.stringify({
                timestamp: info.timestamp,
                level: info.level,
                message: info.message,
            });
        })
    );

    if (getFromEnv(Env.NODE_ENV) === 'prod') {
        winston.add(
            new winston.transports.File({
                filename: `${appRoot}/logs/app.log`,
                handleExceptions: true,
                level: 'warn',
                maxFiles: 15,
                maxsize: 5242880,
                format: myFormat,
                timestamp: true,
            })
        );

        winston.add(
            new winston.transports.File({
                filename: `${appRoot}/logs/app.error.log`,
                handleExceptions: true,
                level: 'error',
                maxFiles: 15,
                maxsize: 5242880,
                format: myFormat,
                timestamp: true,
            })
        );
    } else {
        winston.add(
            new winston.transports.Console({
                handleExceptions: true,
                level: 'debug',
                format: myFormat,
                timestamp: true,
            })
        );
    }
};

module.exports = configureLogger;
