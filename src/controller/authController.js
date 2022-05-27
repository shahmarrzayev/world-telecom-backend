const winston = require('winston');

const { BadRequestException } = require('../exceptions');
const { mapCustomerEntityToPublicDto } = require('../mapper/customerMapper');
const { mapUserEntityToUserView } = require('../mapper/userMapper');
const { customerLogin, login, refreshToken } = require('../service/authService');

/*
 * Customer login.
 */
const customerLoginController = async (req, res) => {
    if (!req.body || !req.body.mobilePhone || !req.body.password) {
        throw new BadRequestException('Enter mobilePhone and password');
    }
    const customer = await customerLogin(res, req.body);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

/**
 * Login.
 */
const loginController = async (req, res) => {
    winston.debug('authController.login -- start');
    const userEntity = await login(res, req.body);
    winston.debug('authController.login -- success');
    return res.send(mapUserEntityToUserView(userEntity));
};

/**
 * Refresh token.
 */
const refreshTokenController = async (req, res) => {
    winston.debug('authController.refreshToken -- start');
    const userEntity = await refreshToken(res, req.header('x-w-t-refresh-token'));
    winston.debug('authController.refreshToken -- success');
    return res.send(mapUserEntityToUserView(userEntity));
};

module.exports = {
    customerLoginController,
    loginController,
    refreshTokenController,
};
