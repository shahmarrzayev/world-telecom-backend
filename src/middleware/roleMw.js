const jwt = require('jsonwebtoken');
const winston = require('winston');

const { Env, UserRole } = require('../enums');
const { BadRequestException, UnauthorizedException, ForbiddenException } = require('../exceptions');
const { checkRole } = require('../service/roleService');
const { getCustomerById } = require('../service/customerService');
const { getUserById } = require('../service/userService');
const { getFromEnv } = require('../utils/commonUtils');

const authenticateUser = async req => {
    const token = req.get('x-w-t-access-token');
    if (!token) {
        winston.warn('roleMW -- no token provided');
        throw new BadRequestException('Daxil olun');
    }

    try {
        const decoded = jwt.verify(token, getFromEnv(Env.W_T_ACCESS_TOKEN_SIGNATURE));

        const { id } = decoded.data;
        const [user, customer] = await Promise.all([getUserById(id, true), getCustomerById(id, true)]);

        if (customer && customer.isActive) {
            customer.isCustomer = true;
            return customer;
        }

        if (!user || !user.isActive) {
            winston.warn('roleMW -- user does not exist or is not active');
            throw new UnauthorizedException('Not authorized');
        }

        return user || customer;
    } catch (error) {
        winston.debug(`roleMW -- ${JSON.stringify(error)}`);
        throw new UnauthorizedException('Yenidən daxil olun');
    }
};

const checkUserRole = async (user, role) => {
    if (user.isCustomer) {
        if (role !== UserRole.CUSTOMER) {
            winston.warn('roleMw -- user not authorized');
            throw new UnauthorizedException('Not authorized');
        }
    } else {
        const userRoles = user.roles;
        if (!userRoles || !userRoles.length) {
            winston.warn('roleMw -- user not authorized');
            throw new UnauthorizedException('Not authorized');
        }
        const validRole = await checkRole(userRoles, role);
        if (!validRole) {
            winston.warn('roleMW -- user not authorized');
            throw new ForbiddenException('Not authorized');
        }
    }
};

module.exports = role => {
    return async (req, res, next) => {
        const user = await authenticateUser(req);
        await checkUserRole(user, role);
        req.user = user;
        next();
    };
};
