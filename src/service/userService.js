const winston = require('winston');

const { Cache } = require('../enums');
const { hashPassword, verifyPassword } = require('./helper/authHelper');
const { findAllUsers, findUserByEmail, findUserById, saveUser } = require('../repository/userRepository');
const {
    BadRequestException,
    GeneralException,
    ConflictException,
    NotFoundException,
    UnauthorizedException,
} = require('../exceptions');
const { flushCache, getFromCache, setInCache } = require('../utils/cacheUtils');

/**
 * Add new user.
 * @param {UserView} user
 * @returns {Promise<UserEntity>}
 */
const addUser = async userView => {
    winston.debug('userService.addUser -- start');
    if (!userView) {
        winston.warn('userService.addUser -- null param');
        throw new GeneralException();
    }

    let userEntity = await findUserByEmail(userView.email);
    if (userEntity) {
        winston.warn('userService.addUser -- user already exists');
        throw new ConflictException('User already exists');
    }

    const hashedPassword = await hashPassword(userView.password);
    if (!hashedPassword) {
        winston.warn('userService.addUser -- could not hash password');
        throw new GeneralException();
    }
    userView.password = hashedPassword;

    userEntity = await saveUser(userView);
    if (!userEntity) {
        winston.warn('userService.addUser -- could not save user');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('userService.addUser -- success');
    return userEntity;
};

/**
 * Change user's password.
 * @param {String} id
 * @param {String} oldPassword
 * @param {String} newPassword
 * @returns {Promise<UserEntity>}
 */
const changePassword = async (id, oldPassword, newPassword) => {
    winston.debug('userService.changePassword -- start');
    if (!id || !oldPassword || !newPassword) {
        winston.warn(`userService.changePassword -- null param: ${id}, ${oldPassword}, ${newPassword}`);
        throw new GeneralException();
    }

    if (oldPassword === newPassword) {
        winston.warn('userService.changePassword -- passwords are same');
        throw new BadRequestException('Passwords are same');
    }

    let userEntity = await findUserById(id);
    if (!userEntity) {
        winston.error('userService.changePassword -- user not found');
        throw new NotFoundException('User not found');
    }

    const correctPassword = await verifyPassword(userEntity.password, oldPassword);
    if (!correctPassword) {
        winston.warn('userService.changePassword -- wrong password');
        throw new UnauthorizedException('Wrong password');
    }

    const newPasswordHash = await hashPassword(newPassword);
    if (!newPasswordHash) {
        winston.warn('userService.changePassword -- could not hash password');
        throw new GeneralException();
    }
    userEntity.password = newPasswordHash;

    userEntity = await saveUser(userEntity);
    if (!userEntity) {
        winston.warn('userService.changePassword -- could not save user');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('userService.changePassword -- success');
    return userEntity;
};

/**
 * Get all users.
 * @returns {Promise<Array<UserEntity>>}
 */
const getAllUsers = async () => {
    winston.debug('userService.getAllUsers -- start');
    const userEntities = await findAllUsers();
    if (!userEntities) {
        winston.warn('userService.getAllUsers -- could not get users');
        throw new GeneralException();
    }
    winston.debug('userService.getAllUsers -- success');
    return userEntities;
};

/**
 * Get user by id.
 * @param {String} id
 * @returns {Promise<UserEntity>}
 */
const getUserById = async (id, returnNull) => {
    winston.debug('userService.getUserById -- start');
    if (!id) {
        winston.warn('userService.getUserById -- null param');
        throw new GeneralException();
    }

    let userEntity = getFromCache(`${Cache.USER}-${id}`);
    if (userEntity) return userEntity;

    userEntity = await findUserById(id);
    if (!userEntity) {
        winston.warn('userService.getUserById -- user not found');
        if (returnNull) return null;
        throw new NotFoundException('User not found');
    }

    setInCache(`${Cache.USER}-${id}`, userEntity);
    winston.debug('userService.getUserById -- success');
    return userEntity;
};

module.exports = {
    addUser,
    changePassword,
    getAllUsers,
    getUserById,
};
