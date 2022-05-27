const appRoot = require('app-root-path');
const { readFileSync } = require('fs');
const { Agent } = require('https');
const winston = require('winston');

const { Env } = require('../enums');
const { getFromEnv } = require('../utils/commonUtils');
const { postRequest } = require('../utils/httpUtils');

let httpsAgent;

/**
 * @private
 * Parse response of format "A: 1\nB: 2\nC: 3" to JS object.
 * @param {String} response
 * @returns {PashaBankResponse}
 */
const parseResponse = response => {
    if (!response) return null;

    const strArr = response.split(/\r?\n/);
    const obj = {};

    if (strArr && strArr.length) {
        strArr.forEach(l => {
            const keyValueArr = l.split(': ');
            // eslint-disable-next-line prefer-destructuring
            obj[keyValueArr[0]] = keyValueArr[1];
        });
    }

    return obj;
};

/**
 * @private
 * Sends HTTP Post request to Pasha Bank.
 * @param {String} url
 * @returns {Promise<PashaBankResponse>}
 */
const sendRequest = async url => {
    if (!url) return null;

    // TODO: Remove this log after testing
    winston.warn(`pashaBankClient.sendRequest -- request url: ${url}`);

    let response;
    try {
        if (!httpsAgent) {
            httpsAgent = new Agent({
                ca: readFileSync(`${appRoot}/PSroot.pem`),
                cert: readFileSync(`${appRoot}/certificate.${getFromEnv(Env.W_T_PASHA_BANK_MERCHANT_ID)}.pem`),
                key: readFileSync(`${appRoot}/pasha_rsa_key_pair.pem`),
                rejectUnauthorized: false,
            });
        }
        response = await postRequest(url, null, null, httpsAgent);
        response = parseResponse(response);
    } catch (error) {
        winston.error(`pashaBankClient.sendRequest -- ${JSON.stringify(error)}`);
        return null;
    }

    if (!response || response.error) {
        winston.warn(`pashaBankClient.sendRequest -- error: ${JSON.stringify(response)}`);
        return null;
    }

    return response;
};

/**
 * Approve transaction.
 * @param {String} transactionId
 * @param {Number} amount
 * @param {String} customerIp
 * @returns {Promise<PashaBankResponse>}
 */
const approvePashaBankTransaction = async (transactionId, amount, customerIp) => {
    winston.warn('pashaBankClient.approvePashaBankTransaction -- start');
    if (!transactionId || !amount || !customerIp) {
        winston.warn('pashaBankClient.approvePashaBankTransaction -- null param');
        return null;
    }

    let url = getFromEnv(Env.W_T_PASHA_BANK_MERCHANT_URL);
    url = `${url}?command=t`;
    url = `${url}&amount=${amount}`;
    url = `${url}&currency=AZN`;
    url = `${url}&client_ip_addr=${customerIp}`;
    url = `${url}&msg_type=DMS`;

    const result = await sendRequest(url);
    winston.warn('pashaBankClient.approvePashaBankTransaction -- start');
    return result;
};

/**
 * Authorize Pasha Bank (Dual Message) payment.
 * @param {Number} amount
 * @param {String} clientIp
 * @returns {Promise<String>} transactionId
 */
const authorizePashaBankTransaction = async (amount, clientIp, installmentPeriod) => {
    winston.warn('pashaBankClient.authorizePashaBankTransaction -- start');
    if (!amount || !clientIp) {
        winston.warn('pashaBankClient.authorizePashaBankTransaction -- null param');
        return null;
    }

    let url = getFromEnv(Env.W_T_PASHA_BANK_MERCHANT_URL);
    url = `${url}?command=v`;
    url = `${url}&amount=${amount}`;
    url = `${url}&currency=944`;
    url = `${url}&client_ip_addr=${clientIp}`;
    url = `${url}&msg_type=DMS`;
    if (installmentPeriod) url = `${url}&taksit=${installmentPeriod}`;

    const response = await sendRequest(url);
    if (!response || !response.TRANSACTION_ID) {
        winston.warn(`pashaBankClient.authorizePashaBankTransaction -- error: ${JSON.stringify(response)}`);
        return null;
    }
    winston.warn('pashaBankClient.authorizePashaBankTransaction -- success');
    return response.TRANSACTION_ID;
};

/**
 * Get transaction result.
 * @param {String} transactionId
 * @param {String} customerIp
 * @returns {Promise<PashaBankResponse>}
 */
const getPashaBankTransactionResult = async (transactionId, customerIp) => {
    winston.warn('pashaBankClient.getPashaBankTransactionResult -- start');
    if (!transactionId) {
        winston.warn('pashaBankClient.getPashaBankTransactionResult -- null param');
        return null;
    }

    let url = getFromEnv(Env.W_T_PASHA_BANK_MERCHANT_URL);
    url = `${url}?command=c`;
    url = `${url}&trans_id=${transactionId}`;
    url = `${url}&client_ip_addr=${customerIp}`;

    const response = await sendRequest(url);
    winston.warn(`pashaBankClient.getPashaBankTransactionResult -- ${JSON.stringify(response)}`);
    winston.warn('pashaBankClient.getPashaBankTransactionResult -- success');
    return response;
};

/**
 * Reverse authorized Pasha Bank transaction.
 * @param {String} transactionId
 * @param {Number} amount
 * @returns {Promise<PashaBankResponse>}
 */
const reversePashaBankTransaction = async (transactionId, amount) => {
    winston.warn('pashaBankClient.reversePashaBankTransaction -- start');
    if (!transactionId || !amount) {
        winston.warn('pashaBankClient.reversePashaBankTransaction -- null param');
        return null;
    }

    let url = getFromEnv(Env.W_T_PASHA_BANK_MERCHANT_URL);
    url = `${url}?command=r`;
    url = `${url}&trans_id=${transactionId}`;
    url = `${url}&amount=${amount}`;

    const response = await sendRequest(url);
    winston.warn('pashaBankClient.reversePashaBankTransaction -- success');
    return response;
};

module.exports = {
    approvePashaBankTransaction,
    authorizePashaBankTransaction,
    getPashaBankTransactionResult,
    reversePashaBankTransaction,
};
