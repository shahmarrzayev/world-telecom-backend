const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const Role = require('./models/roleModel');
const { flushCache } = require('../utils/cacheUtils');

const findRoleByName = async (name, transaction) => {
    winston.debug('roleRepository.findRoleByName -- start');
    if (!name) {
        winston.warn('roleRepository.findRoleByName -- null parm');
        return null;
    }
    const role = await runQuery(() => Role.findOne({ name }).session(transaction));
    winston.debug('roleRepository.findRoleByName -- success');
    return role;
};

const saveRole = async (role, transaction) => {
    winston.debug('roleRepository.saveRole -- start');
    if (!role) {
        winston.warn('roleRepository.saveRole -- null parm');
        return null;
    }
    const dbRole = new Role(role);
    const savedRole = await runQuery(() => dbRole.save({ session: transaction }));
    flushCache();
    winston.debug('roleRepository.saveRole -- success');
    return savedRole;
};

module.exports = {
    findRoleByName,
    saveRole,
};
