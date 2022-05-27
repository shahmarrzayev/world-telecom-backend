const { createHash } = require('crypto');
const { stringify } = require('querystring');
const winston = require('winston');

const { Env } = require('../enums');
const { getFromEnv } = require('../utils/commonUtils');
const { getRequest } = require('../utils/httpUtils');

/**
 * Creates signature key for payment.
 * @private
 * @param {PaymentInfo} paymentReq
 */
const createSignature = paymentReq => {
    if (!paymentReq) return null;

    let signatureStr = '';
    Object.keys(paymentReq).forEach(key => {
        signatureStr += paymentReq[key];
    });
    signatureStr += getFromEnv(Env.W_T_PAYMENT_SECRET_KEY);

    let signature;
    try {
        signature = createHash('md5')
            .update(signatureStr)
            .digest()
            .toString('base64');
    } catch (error) {
        winston.error(`paymentClient.createSignature -- ${error}`);
        return null;
    }

    return signature;
};

/**
 * Returns necessary headers for payment client.
 * @private
 * @param {Object} signature
 */
const getHeaders = signature => {
    return {
        'X-Merchant': getFromEnv(Env.W_T_PAYMENT_MERCHANT_ID),
        'X-Signature': signature,
        'X-Type': 'JSON',
    };
};

/**
 * Reverts payment.
 * @param {String} reference
 * @returns {Promise<ClientResponse>}
 */
const cancelYigimPayment = async reference => {
    winston.debug('paymentClient.cancelYigimPayment -- start');
    if (!reference) {
        winston.warn('paymentClient.cancelYigimPayment -- null param');
        return null;
    }

    const signature = createSignature({ reference });
    if (!signature) {
        winston.warn('paymentClient.cancelYigimPayment -- could not create signature');
        return null;
    }

    const cancelUrl = `${getFromEnv(Env.W_T_PAYMENT_CLIENT_URL)}/cancel?reference=${reference}`;
    let response;
    try {
        response = await getRequest(cancelUrl, getHeaders(signature));
        // Could not cancel possibly because end of day operation ended. Try to refund.
        if (response.code !== 0) {
            const refundUrl = `${getFromEnv(Env.W_T_PAYMENT_CLIENT_URL)}/refund?reference=${reference}`;
            response = await getRequest(refundUrl, getHeaders(signature));
        }
    } catch (error) {
        winston.error(`paymentClient.cancelYigimPayment -- ${JSON.stringify(error)}`);
        return null;
    }
    winston.debug('paymentClient.cancelYigimPayment -- success');
    return response;
};

/**
 * Returns the status of the payment.
 * @param {String} reference
 * @returns {Promise<Object>}
 */
const getYigimPaymentStatus = async reference => {
    winston.debug('paymentClient.getYigimPaymentStatus -- start');
    if (!reference) {
        winston.warn('paymentClient.getYigimPaymentStatus -- null param');
        return null;
    }

    const signature = createSignature({ reference });
    if (!signature) {
        winston.warn('paymentClient.getYigimPaymentStatus -- could not create signature');
        return null;
    }

    const url = `${getFromEnv(Env.W_T_PAYMENT_CLIENT_URL)}/status?reference=${reference}`;
    let response;
    try {
        response = await getRequest(url, getHeaders(signature));
    } catch (error) {
        winston.error(`paymentClient.getYigimPaymentStatus -- ${JSON.stringify(error)}`);
        return null;
    }
    winston.debug('paymentClient.getYigimPaymentStatus -- success');
    return response;
};

/**
 * Initializes payment with the client and returns url.
 * @param {String} reference
 * @param {Number} amount
 * @returns {Promise<ClientResponse>}
 */
const initializeYigimPayment = async (reference, amount) => {
    winston.debug('paymentClient.initializeYigimPayment -- start');
    if (!reference || !amount) {
        winston.warn('paymentClient.initializeYigimPayment -- null param');
        return null;
    }

    const paymentReq = {
        reference,
        type: getFromEnv(Env.W_T_PAYMENT_TYPE),
        save: 'n',
        amount,
        currency: getFromEnv(Env.W_T_PAYMENT_CURRENCY),
        biller: getFromEnv(Env.W_T_PAYMENT_BILLER_ID),
        description: 'Payments',
        template: getFromEnv(Env.W_T_PAYMENT_TEMPLATE_ID),
        language: 'az',
        callback: 'https://api.wtpanel.com/api/payments',
    };

    const signature = createSignature(paymentReq);
    if (!signature) {
        winston.warn('paymentClient.initializeYigimPayment -- could not create signature');
        return null;
    }

    const url = `${getFromEnv(Env.W_T_PAYMENT_CLIENT_URL)}/create?${stringify(paymentReq)}`;
    let response;
    try {
        response = await getRequest(url, getHeaders(signature));
    } catch (error) {
        winston.error(`paymentClient.initializeYigimPayment -- ${JSON.stringify(error)}`);
        return null;
    }
    winston.debug('paymentClient.initializeYigimPayment -- success');
    return response;
};

module.exports = {
    cancelYigimPayment,
    getYigimPaymentStatus,
    initializeYigimPayment,
};
