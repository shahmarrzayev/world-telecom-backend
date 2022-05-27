const winston = require('winston');

const { UnauthorizedException, GeneralException } = require('../exceptions');
const { generateToken, setAuthHeaders, verifyPassword, verifyRefreshToken } = require('./helper/authHelper');
const { findCustomerByPhone, findCustomerById } = require('../repository/customerRepository');
const { findUserByEmail, findUserById } = require('../repository/userRepository');

/**
 * @private
 * Verify user password and generate tokens.
 * @param {UserEntity | CustomerEntity} entity
 * @param {String} password
 * @returns {Promise<{ accessToken: String, refreshToken: String }>}
 */
const verifyUser = async (entity, password) => {
    const passwordIsCorrect = await verifyPassword(entity.password, password);
    if (!passwordIsCorrect) {
        winston.warn('authService.login -- wrong password');
        throw new UnauthorizedException('Yalnış istifadəçi adı və ya şifrə');
    }

    const accessToken = entity.mobilePhone ? generateToken(entity._id, entity.mobilePhone) : generateToken(entity._id, entity.email);
    const refreshToken = entity.mobilePhone ? generateToken(entity._id, entity.mobilePhone, true) : generateToken(entity._id, entity.email, true);
    if (!accessToken || !refreshToken) {
        winston.warn(`authService.login -- couldn't generate token: ${accessToken}, ${refreshToken}`);
        throw new GeneralException();
    }

    return { accessToken, refreshToken };
};

/**
 * Login customer.
 * @param {Response} res
 * @param {LoginView} loginView
 * @returns {Promise<CustomerEntity>}
 */
const customerLogin = async (res, loginView) => {
    winston.debug('authService.customerLogin -- start');
    if (!res || !loginView) {
        winston.warn('authService.customerLogin -- invalid args');
        throw new GeneralException();
    }

    const customer = await findCustomerByPhone(loginView.mobilePhone);
    if (!customer) {
        winston.warn('authService.customerLogin -- customer not found');
        throw new UnauthorizedException();
    }

    
    const { accessToken, refreshToken } = (await verifyUser(customer, loginView.password)) || {};
    const headersAreSet = setAuthHeaders(res, accessToken, refreshToken);
    if (!headersAreSet) {
        winston.warn('authService.login -- couldn not set headers');
        throw new GeneralException();
    }
    winston.debug('authService.customerLogin -- success');
    return customer;
};

/**
 * Login user.
 * @param {Response} res
 * @param {LoginView} loginView
 * @returns {Promise<UserEntity>}
 */
const login = async (res, loginView) => {
    winston.debug('authService.login -- start');
    if (!res || !loginView || !loginView.email || !loginView.password) {
        winston.warn(`authService.login -- null param: ${res}, ${loginView}`);
        throw new GeneralException();
    }

    const { email, password } = loginView;

    const userEntity = await findUserByEmail(email);
    if (!userEntity) {
        winston.warn('authService.login -- user not found');
        throw new UnauthorizedException('Yalnış istifadəçi adı və ya şifrə');
    }

    const { accessToken, refreshToken } = (await verifyUser(userEntity, password)) || {};

    const headersAreSet = setAuthHeaders(res, accessToken, refreshToken);
    if (!headersAreSet) {
        winston.warn('authService.login -- couldn not set headers');
        throw new GeneralException();
    }
    winston.debug('authService.login -- success');
    return userEntity;
};

/**
 * Refresh token.
 * @param {Response} res
 * @param {String} token
 * @returns {Promise<UserEntity>} userEntity
 */
const refreshToken = async (res, token) => {
    winston.debug('authService.refreshToken -- start');
    if (!res || !token) {
        winston.warn(`authService.refreshToken -- null param: ${res}, ${token}`);
        throw new UnauthorizedException('Token is missing');
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded || !decoded.data || !decoded.data.id || !decoded.data.email) {
        winston.warn('authService.refreshToken -- invalid refresh token');
        throw new UnauthorizedException('Yenidən daxil olun');
    }
    const { id, email } = decoded.data;

    const [user, customer] = await Promise.all([findUserById(id), findCustomerById(id)]);
    if (!user && !customer) {
        winston.warn('authService.refreshToken -- user not found');
        throw new UnauthorizedException('Yenidən daxil olun');
    }

    const accessToken = generateToken(id, email);
    if (!accessToken) {
        winston.warn(`authService.refreshToken -- couldn't generate token`);
        throw new GeneralException();
    }

    const headersAreSet = setAuthHeaders(res, accessToken, token);
    if (!headersAreSet) {
        winston.warn('authService.refreshToken -- could not set headers');
        throw new GeneralException();
    }
    winston.debug('authService.refreshToken -- success');
    return user || customer;
};

module.exports = {
    customerLogin,
    login,
    refreshToken
};
