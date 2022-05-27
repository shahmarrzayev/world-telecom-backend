const winston = require('winston');
const sendGridMail = require('@sendgrid/mail');

const { Env } = require('../enums');
const { getFromEnv } = require('../utils/commonUtils');

/**
 * Send mail.
 * @param {String} to
 * @param {String} subject
 * @param {String} text
 */
const sendMail = (to, subject, text) => {
    winston.debug('mailClient.sendMail -- start');
    if (!to || !subject || !text) {
        winston.warn(`mailClient.sendMail -- null param: ${to}, ${subject}, ${text}`);
        return;
    }

    try {
        const sendGridKey = getFromEnv(Env.W_T_SENDGRID_API_KEY);
        const from = getFromEnv(Env.W_T_SENDGRID_FROM);

        sendGridMail.setApiKey(sendGridKey);
        sendGridMail.send({ to, from, subject, text });
    } catch (error) {
        winston.error(`mailClient.sendMail -- ${JSON.stringify(error)}`);
        return;
    }
    winston.debug('mailClient.sendMail -- success');
};

module.exports = {
    sendMail,
};
