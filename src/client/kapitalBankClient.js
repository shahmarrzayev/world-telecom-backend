const appRoot = require('app-root-path');
const { readFileSync } = require('fs');
const { Agent } = require('https');
const winston = require('winston');
const xmlbuilder = require('xmlbuilder');

const { Env } = require('../enums');
const { convertXmlToObj, createRandomNumber, getFromEnv } = require('../utils/commonUtils');
const { postRequest } = require('../utils/httpUtils');

let httpsAgent;

const sendRequest = async xml => {
    const crtFile = getFromEnv(Env.NODE_ENV) === 'prod' ? 'w-t-pro.crt' : 'test-world-telecom.crt';
    const keyFile = getFromEnv(Env.NODE_ENV) === 'prod' ? 'w-t-pro.key' : 'world-telecom.key';

    let responseJson;
    try {
        if (!httpsAgent) {
            httpsAgent = new Agent({
                cert: readFileSync(`${appRoot}/${crtFile}`),
                key: readFileSync(`${appRoot}/${keyFile}`),
                rejectUnauthorized: false,
            });
        }

        const responseXml = await postRequest(
            getFromEnv(Env.W_T_KAPITAL_BANK_CLIENT_URL),
            xml,
            { 'Content-Type': 'text/xml' },
            httpsAgent
        );

        responseJson = await convertXmlToObj(responseXml);
    } catch (error) {
        winston.error(`kapitalBankClient.createBirKartPayment -- ${JSON.stringify(error)}`);
        return null;
    }
    return responseJson;
};

/**
 * Creates a Kapital Bank BirKart installment payment.
 * @param {Number} amount
 * @param {Number} installmentPeriod
 * @returns {Promise<BirKartClientView>}
 */
const createBirKartPayment = async (amount, installmentPeriod) => {
    winston.debug('kapitalBankClient.createBirKartPayment -- start');
    if (!amount || !installmentPeriod) {
        winston.warn('kapitalBankClient.createBirKartPayment -- null param');
        return null;
    }

    const xml = xmlbuilder
        .create({
            TKKPG: {
                Request: {
                    Operation: { '#text': 'CreateOrder' },
                    Language: { '#text': 'AZ' },
                    Order: {
                        OrderType: { '#text': 'Purchase' },
                        Merchant: { '#text': getFromEnv(Env.W_T_KAPITAL_BANK_MERCHANT_ID) },
                        Amount: { '#text': amount },
                        Currency: { '#text': getFromEnv(Env.W_T_PAYMENT_CURRENCY) },
                        Description: { '#text': `${createRandomNumber(10000, 99999)}/TAKSIT=${installmentPeriod}` },
                        ApprovalURL: { '#text': getFromEnv(Env.W_T_KAPITAL_BANK_CALLBACK_URL) },
                        CancelURL: { '#text': getFromEnv(Env.W_T_KAPITAL_BANK_CALLBACK_URL) },
                        DeclineURL: { '#text': getFromEnv(Env.W_T_KAPITAL_BANK_CALLBACK_URL) },
                    },
                },
            },
        })
        .end();

    const responseJson = await sendRequest(xml);
    if (!responseJson || !responseJson.TKKPG || !responseJson.TKKPG.Response) {
        winston.warn('kapitalBankClient.getBirKartPaymentStatus -- could not convert to json');
        return null;
    }
    winston.debug('kapitalBankClient.createBirKartPayment -- success');
    return {
        status: responseJson.TKKPG.Response[0].Status[0],
        orderId: responseJson.TKKPG.Response[0].Order[0].OrderID[0],
        sessionId: responseJson.TKKPG.Response[0].Order[0].SessionID[0],
        url: responseJson.TKKPG.Response[0].Order[0].URL[0],
    };
};

/**
 * Retrieves birkart payment information.
 * @param {String} orderId
 * @returns {Promise<Object>}
 */
const getBirKartPaymentStatus = async (orderId, sessionId) => {
    winston.debug('kapitalBankClient.getBirKartPaymentStatus -- start');
    const xml = xmlbuilder
        .create({
            TKKPG: {
                Request: {
                    Operation: { '#text': 'GetOrderStatus' },
                    Language: { '#text': 'AZ' },
                    Order: {
                        Merchant: { '#text': getFromEnv(Env.W_T_KAPITAL_BANK_MERCHANT_ID) },
                        OrderID: { '#text': orderId },
                    },
                    SessionID: { '#text': sessionId },
                },
            },
        })
        .end();

    const responseJson = await sendRequest(xml);
    if (!responseJson || !responseJson.TKKPG || !responseJson.TKKPG.Response) {
        winston.warn('kapitalBankClient.getBirKartPaymentStatus -- could not convert to json');
        return null;
    }

    winston.debug('kapitalBankClient.getBirKartPaymentStatus -- success');
    return {
        orderId: responseJson.TKKPG.Response[0].Order[0].OrderID[0],
        status: responseJson.TKKPG.Response[0].Order[0].OrderStatus[0],
    };
};

module.exports = {
    createBirKartPayment,
    getBirKartPaymentStatus,
};
