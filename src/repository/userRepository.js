const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const User = require('./models/userModel');
const { flushCache } = require('../utils/cacheUtils');

const findAllUsers = async transaction => {
    winston.debug('userRepository.findAllUsers -- start');
    const users = await runQuery(() => User.find({ session: transaction }));
    winston.debug('userRepository.findAllUsers -- success');
    return users;
};

const findUserByEmail = async (email, transaction) => {
    winston.debug('userRepository.findUserByEmail -- start');
    if (!email) {
        winston.warn('userRepository.findUserByEmail -- null param');
        return null;
    }
    const user = await runQuery(() => User.findOne({ email }).session(transaction));
    winston.debug('userRepository.findUserByEmail -- success');
    return user;
};

const findUserById = async (id, transaction) => {
    winston.debug('userRepository.findUserById -- start');
    if (!id) {
        winston.warn('userRepository.findUserById -- null param');
        return null;
    }
    const user = await runQuery(() => User.findById(id).session(transaction));
    winston.debug('userRepository.findUserById -- success');
    return user;
};

const saveUser = async (user, transaction) => {
    winston.debug('userRepository.saveUser -- start');
    if (!user) {
        winston.warn('userRepository.saveUser -- null param');
        return null;
    }
    const dbUser = new User(user);
    const savedUser = await runQuery(() => dbUser.save({ session: transaction }));
    flushCache();
    winston.debug('userRepository.saveUser -- success');
    return savedUser;
};

module.exports = {
    findAllUsers,
    findUserByEmail,
    findUserById,
    saveUser,
};
