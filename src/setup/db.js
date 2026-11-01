const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const winston = require('winston');

const { Env } = require('../enums');
const { getFromEnv } = require('../utils/commonUtils');

const setupDbConnection = () => {
    return new Promise((resolve, reject) => {
        let dbAddr = null;
        if (process.env.NODE_ENV === 'prod') {
            const certFile = `${appRoot}/w-t-do-mongo-ca-certificate.crt`;
            dbAddr = `mongodb+srv://${getFromEnv(Env.W_T_DB_USER)}:${getFromEnv(Env.W_T_DB_PASSWORD)}@${getFromEnv(
                Env.W_T_DB_HOST
            )}&tlsCAFile=${certFile}`;
        } else {
            dbAddr = `mongodb+srv://${getFromEnv(Env.W_T_DB_USER)}:${getFromEnv(Env.W_T_DB_PASSWORD)}@${getFromEnv(
                Env.W_T_DB_HOST
            )}`;
        }

        mongoose
            .connect(dbAddr, {
                keepAlive: true,
                keepAliveInitialDelay: 300000,
                serverSelectionTimeoutMS: 5000, // 5 sec
                socketTimeoutMS: 300000, // 5 min
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            .then(() => {
                winston.info('Connected to DB...');
                resolve();
            })
            .catch(err => {
                winston.error(`Error connecting to db ${err}`);
            });
    });
};

module.exports = setupDbConnection;
