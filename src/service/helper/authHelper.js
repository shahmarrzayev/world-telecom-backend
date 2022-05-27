const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const winston = require('winston');

const { Env } = require('../../enums');
const { getFromEnv } = require('../../utils/commonUtils');

/**
 * Generates jwt with id and email in payload.
 * @param {String} id
 * @param {String} email
 * @returns {String} token
 */
const generateToken = (id, email, isRefresh) => {
    winston.debug('authHelper.generateToken -- start');
    if (!id || !email) {
        winston.warn(`authHelper.generateToken -- null param: ${id}, ${email}`);
        return null;
    }

    const data = { id, email };
    const expiration = isRefresh ? getFromEnv(Env.W_T_REFRESH_TOKEN_EXPIRE) : getFromEnv(Env.W_T_ACCESS_TOKEN_EXPIRE);
    const signature = isRefresh
        ? getFromEnv(Env.W_T_REFRESH_TOKEN_SIGNATURE)
        : getFromEnv(Env.W_T_ACCESS_TOKEN_SIGNATURE);

    let token = null;
    try {
        token = jwt.sign({ data }, signature, { expiresIn: expiration });
    } catch (error) {
        winston.error(`authHelper.generateToken -- ${JSON.stringify(error)}`);
        return null;
    }
    winston.debug('authHelper.generateToken -- success');
    return token;
};

/**
 * Hashes password with argon2 algorithm.
 * @param {String} password
 * @returns {Promise<String>} hashedPassword
 */
const hashPassword = async password => {
    winston.debug('authHelper.hashPassword -- start');
    if (!password) {
        winston.warn('authHelper.hashPassword -- null param');
        return null;
    }

    let hashedPassword = null;
    try {
        hashedPassword = await argon2.hash(password);
    } catch (error) {
        winston.error(`authHelper.hashPassword -- ${JSON.stringify(error)}`);
        return null;
    }
    winston.debug('authHelper.hashPassword -- success');
    return hashedPassword;
};

/**
 * Sets token headers.
 * @param {Response} res
 * @param {String} accessToken
 * @param {String} refreshToken
 * @returns {Boolean} status of the operation
 */
const setAuthHeaders = (res, accessToken, refreshToken) => {
    if (!res || !res.set || !accessToken || !refreshToken) {
        winston.warn(`authHelper.setAuthHeaders -- null param: ${res}, ${accessToken}, ${refreshToken}`);
        return false;
    }
    res.set({
        'x-w-t-access-token': accessToken,
        'x-w-t-refresh-token': refreshToken,
    });
    return true;
};

/**
 * Verifies user password for login.
 * @param {String} hash
 * @param {String} password
 * @returns {Promise<Boolean>} verification result
 */
const verifyPassword = async (hash, password) => {
    winston.debug('authHelper.verifyPassword -- start');
    if (!hash || !password) {
        winston.warn(`authHelper.verifyPassword -- null param: ${hash}, ${password}`);
        return false;
    }

    let isCorrectPassword = false;
    try {
        isCorrectPassword = await argon2.verify(hash, password);
    } catch (error) {
        winston.error(`authHelper.verifyPassword -- ${JSON.stringify(error)}`);
        return false;
    }
    winston.debug('authHelper.verifyPassword -- success');
    return isCorrectPassword;
};

/**
 * Verifies if refresh token is valid.
 * @param {String} refreshToken
 * @returns {Object} decoded token
 */
const verifyRefreshToken = token => {
    winston.debug('authHelper.verifyRefreshToken -- start');
    if (!token) {
        winston.warn('authHelper.verifyRefreshToken -- null param');
        return null;
    }

    let decoded;
    try {
        decoded = jwt.verify(token, getFromEnv(Env.W_T_REFRESH_TOKEN_SIGNATURE));
    } catch (error) {
        winston.error(`authHelper.verifyRefreshToken -- ${JSON.stringify(error)}`);
        return null;
    }
    winston.debug('authHelper.verifyRefreshToken -- success');
    return decoded;
};

module.exports = {
    generateToken,
    hashPassword,
    setAuthHeaders,
    verifyPassword,
    verifyRefreshToken,
};
