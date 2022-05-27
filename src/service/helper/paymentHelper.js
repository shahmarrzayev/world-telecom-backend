const crypto = require('crypto');
const winston = require('winston');

const { Env } = require('../../enums');
const { getFromEnv } = require('../../utils/commonUtils');

/**
 * PRIVATE
 * Converts hex to binary.
 * @param {String} hex
 * @returns {String}
 */
const hex2bin = hex => {
    if (!hex) return null;

    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }

    // eslint-disable-next-line prefer-spread
    return String.fromCharCode.apply(String, bytes);
};

/**
 * PRIVATE
 * Generates auth code for Azericard.
 * @param {String} data
 * @param {String} signatureKey
 * @returns {String} authCode
 */
const generateAzericardPSign = (data, signatureKey) => {
    if (!data || !signatureKey) {
        winston.warn(`paymentHelper.generateAuthenticationCode -- null param: ${data}, ${signatureKey}`);
        return null;
    }

    let authCode;
    try {
        const signatureKeyBinary = hex2bin(signatureKey);
        if (!signatureKeyBinary) return null;

        authCode = crypto
            .createHmac('sha1', Buffer.from(signatureKeyBinary, 'binary'))
            .update(Buffer.from(data, 'utf-8'))
            .digest('hex');
    } catch (error) {
        winston.error(`paymentHelper.generateAuthenticationCode -- ${JSON.stringify(error)}`);
        return null;
    }
    return authCode;
};

/**
 * Generate PSign for Azericard payment checkout.
 * @param {PaymentEntity} payment
 * @returns String pSign
 */
const generateAzericardCheckoutPSign = (payment, transactionType) => {
    winston.debug('paymentHelper.generateAzericardCheckoutPSign -- start');
    if (!payment) {
        winston.debug('paymentHelper.generateAzericardCheckoutPSign -- null param');
        return null;
    }

    const sourceString = ''.concat(
        payment.azericard.order.length,
        payment.azericard.order.toString(),
        payment.amount.toString().length,
        payment.amount,
        getFromEnv(Env.W_T_AZERICARD_CURRENCY).length,
        getFromEnv(Env.W_T_AZERICARD_CURRENCY),
        payment.azericard.rrn.length,
        payment.azericard.rrn,
        payment.azericard.intRef.length,
        payment.azericard.intRef,
        transactionType.length,
        transactionType,
        getFromEnv(Env.W_T_AZERICARD_TERMINAL_ID).length,
        getFromEnv(Env.W_T_AZERICARD_TERMINAL_ID),
        payment.azericard.completitionTimestamp.length,
        payment.azericard.completitionTimestamp,
        payment.azericard.completitionNonce.length,
        payment.azericard.completitionNonce
    );
    if (!sourceString.length) {
        winston.warn('paymentHelper.generateAzericardCheckoutPSign -- could not generate string');
        return null;
    }

    const pSign = generateAzericardPSign(sourceString, getFromEnv(Env.W_T_AZERICARD_SIGNATURE_KEY));
    winston.debug('paymentHelper.generateAzericardCheckoutPSign -- success');
    return pSign;
};

/**
 * Generates an auth code for payment initialization.
 * @param {PaymentEntity} payment
 * @param {String} trType (transaction type)
 * @returns {String} pSign
 */
const generateAzericardInitPSign = (payment, trType) => {
    winston.debug('paymentHelper.generateAzericardInitPSign -- start');
    if (!payment || !payment.azericard) {
        winston.warn('paymentHelper.generateAzericardInitPSign -- null param');
        return null;
    }

    const sourceString = ''.concat(
        payment.amount.toString().length,
        payment.amount,
        getFromEnv(Env.W_T_AZERICARD_CURRENCY).length,
        getFromEnv(Env.W_T_AZERICARD_CURRENCY),
        payment.azericard.order.length,
        payment.azericard.order.toString(),
        getFromEnv(Env.W_T_AZERICARD_DESC).length,
        getFromEnv(Env.W_T_AZERICARD_DESC),
        getFromEnv(Env.W_T_AZERICARD_MERCH_NAME).length,
        getFromEnv(Env.W_T_AZERICARD_MERCH_NAME),
        getFromEnv(Env.W_T_AZERICARD_MERCH_URL).length,
        getFromEnv(Env.W_T_AZERICARD_MERCH_URL),
        getFromEnv(Env.W_T_AZERICARD_TERMINAL_ID).length,
        getFromEnv(Env.W_T_AZERICARD_TERMINAL_ID),
        getFromEnv(Env.W_T_AZERICARD_EMAIL).length,
        getFromEnv(Env.W_T_AZERICARD_EMAIL),
        trType.length,
        trType,
        getFromEnv(Env.W_T_AZERICARD_COUNTRY).length,
        getFromEnv(Env.W_T_AZERICARD_COUNTRY),
        getFromEnv(Env.W_T_AZERICARD_MERCH_GMT).length,
        getFromEnv(Env.W_T_AZERICARD_MERCH_GMT),
        payment.azericard.timestamp.length,
        payment.azericard.timestamp,
        payment.azericard.nonce.length,
        payment.azericard.nonce,
        getFromEnv(Env.W_T_AZERICARD_BACK_REF).length,
        getFromEnv(Env.W_T_AZERICARD_BACK_REF)
    );
    if (!sourceString.length) {
        winston.warn('paymentHelper.generateAzericardInitPSign -- could not generate string');
        return null;
    }

    const pSign = generateAzericardPSign(sourceString, getFromEnv(Env.W_T_AZERICARD_SIGNATURE_KEY));
    winston.debug('paymentHelper.generateAzericardInitPSign -- success');
    return pSign;
};

/**
 * Generates nonce (random 32 byte string).
 * Returns null on error.
 * @returns {Promise<String>} nonce
 */
const generateNonce = () => {
    return new Promise(resolve => {
        winston.debug('paymentHelper.generateNonce -- start');
        crypto.randomBytes(8, (err, buffer) => {
            if (err) {
                resolve(null);
            }
            const token = buffer.toString('hex');
            winston.debug('paymentHelper.generateNonce -- success');
            resolve(token);
        });
    });
};

/**
 * Create md5 hash for Unibank.
 * @param {String} reference
 * @param {String} amount
 * @returns {Promise<String>}
 */
const generateUnibankSignature = async (reference, amount, description) => {
    if (!reference || !amount) {
        winston.warn('paymentHelper.generateUnibankSignature -- null param');
    }
    const sourceString = ''.concat(
        getFromEnv(Env.W_T_UNIBANK_MID).length,
        getFromEnv(Env.W_T_UNIBANK_MID),
        `${amount}`.length,
        amount,
        '944'.length,
        '944',
        description.length,
        description,
        reference.length,
        reference,
        'az'.length,
        'az',
        getFromEnv(Env.W_T_UNIBANK_SECRET_KEY)
    );
    return crypto
        .createHash('md5')
        .update(sourceString)
        .digest('hex')
        .toUpperCase();
};

const getAzericardInitData = paymentEntity => {
    if (!paymentEntity) {
        winston.warn('paymentHelper.getAzericardInitData -- null param');
        return null;
    }
    return {
        AMOUNT: paymentEntity.amount,
        CURRENCY: getFromEnv(Env.W_T_AZERICARD_CURRENCY),
        ORDER: paymentEntity.azericard.order,
        DESC: getFromEnv(Env.W_T_AZERICARD_DESC),
        MERCH_NAME: getFromEnv(Env.W_T_AZERICARD_MERCH_NAME),
        MERCH_URL: getFromEnv(Env.W_T_AZERICARD_MERCH_URL),
        TERMINAL: getFromEnv(Env.W_T_AZERICARD_TERMINAL_ID),
        EMAIL: getFromEnv(Env.W_T_AZERICARD_EMAIL),
        TRTYPE: paymentEntity.azericard.lastTransactionType,
        COUNTRY: getFromEnv(Env.W_T_AZERICARD_COUNTRY),
        MERCH_GMT: getFromEnv(Env.W_T_AZERICARD_MERCH_GMT),
        TIMESTAMP: paymentEntity.azericard.timestamp,
        NONCE: paymentEntity.azericard.nonce,
        BACKREF: getFromEnv(Env.W_T_AZERICARD_BACK_REF),
        P_SIGN: paymentEntity.azericard.pSign,
        url: getFromEnv(Env.W_T_AZERICARD_URL),
    };
};

module.exports = {
    generateAzericardCheckoutPSign,
    generateAzericardInitPSign,
    generateNonce,
    generateUnibankSignature,
    getAzericardInitData,
};
