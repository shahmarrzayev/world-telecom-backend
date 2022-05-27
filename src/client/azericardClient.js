const { stringify } = require('querystring');
const winston = require('winston');

const { Env } = require('../enums');
const { getFromEnv } = require('../utils/commonUtils');
const { postRequest } = require('../utils/httpUtils');

/**
 * Checkout/Approve Azericard payment.
 * @param {AzCardPaymentRequest} azericardCheckoutRequest
 * @returns {Promise<String>} responseCode
 */
const checkoutAzericardPayment = async azericardCheckoutRequest => {
    winston.warn('azericardClient.checkoutAzericardPayment -- start');
    if (!azericardCheckoutRequest) {
        winston.warn('azericardClient.checkoutAzericardPayment -- null param');
        return null;
    }

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    let responseCode = null;
    try {
        responseCode = await postRequest(
            getFromEnv(Env.W_T_AZERICARD_URL),
            stringify(azericardCheckoutRequest),
            headers
        );
    } catch (error) {
        winston.error(`azericardClient.checkoutAzericardPayment -- ${JSON.stringify(error)}`);
        return null;
    }
    winston.warn(`azericardClient.checkoutAzericardPayment -- success: ${JSON.stringify(responseCode)}`);
    return responseCode;
};

module.exports = {
    checkoutAzericardPayment,
};
