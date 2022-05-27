const winston = require('winston');

const { Env } = require('../enums');
const { convertXmlToObj, getFromEnv } = require('../utils/commonUtils');
const { getRequest } = require('../utils/httpUtils');

/**
 * Gets the transaction status from Unibank.
 * @param {String} reference
 * @returns {Promise<UnibankTransactionStatus>}
 */
const getUnibankTransactionStatus = async reference => {
    winston.debug('unibankClient.getUnibankTransactionStatus -- start');
    if (!reference) {
        winston.warn('unibankClient.getUnibankTransactionStatus -- null param');
        return null;
    }

    let url = `${getFromEnv(Env.W_T_UNIBANK_URL)}/status`;
    url = `${url}?mid=${getFromEnv(Env.W_T_UNIBANK_MID)}&reference=${reference}`;

    let unibankResponse;
    try {
        const xmlResponse = await getRequest(url);
        const { response } = await convertXmlToObj(xmlResponse);
        unibankResponse = response;
    } catch (error) {
        winston.error(`unibankClient.getUnibankTransactionStatus -- ${JSON.stringify(error)}`);
        return null;
    }
    winston.debug('unibankClient.getUnibankTransactionStatus -- success');
    return {
        amount: unibankResponse.amount[0],
        code: unibankResponse.code[0],
        rrn: unibankResponse.rrn[0],
        xid: unibankResponse.xid[0],
    };
};

module.exports = {
    getUnibankTransactionStatus,
};
