const winston = require('winston');

const { Cache, UserRole } = require('../enums');
const { GeneralException, NotFoundException } = require('../exceptions');
const { findRoleByName, saveRole } = require('../repository/roleRepository');
const { flushCache, getFromCache, setInCache } = require('../utils/cacheUtils');

/**
 * Add new role.
 * @param {RoleView} role
 * @param {UserEntity} user
 * @returns {Promise<RoleEntity>}
 */
const addNewRole = async (role, user) => {
    winston.debug('roleService.addNewRole -- start');
    if (!role || !user) {
        winston.warn(`roleService.addNewRole -- null param: ${JSON.stringify(role)}, ${JSON.stringify(user)}`);
        throw new GeneralException();
    }

    let ancestors = [];
    if (role.ancestor) {
        const ancestorRoleEntity = await findRoleByName(role.ancestor);
        if (!ancestorRoleEntity) {
            winston.warn('roleService.addNewRole -- ancestor role not found');
            throw new NotFoundException('Ancestor role not found');
        }
        ancestorRoleEntity.ancestors.push(ancestorRoleEntity.name);
        ancestors = ancestorRoleEntity.ancestors;
    } else {
        ancestors = [UserRole.ADMIN];
    }
    role.ancestors = ancestors;
    role.createdBy = user._id;

    const roleEntity = await saveRole(role);
    if (!roleEntity) {
        winston.warn('roleService.addNewRole -- could not save role');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('roleService.addNewRole -- success');
    return roleEntity;
};

/**
 * Checks if user's role is valid for operation.
 * @param {Array<String>} userRoles,
 * @param {String} requiredRoleName
 * @returns {Promise<Boolean>}
 */
const checkRole = async (userRoles, requiredRoleName) => {
    winston.debug('roleService.checkRole -- start');
    if (!userRoles || !userRoles.length || !requiredRoleName) {
        winston.warn('roleService.checkRole -- null param');
        return false;
    }

    if (userRoles.includes(requiredRoleName)) {
        return true;
    }

    let role = getFromCache(`${Cache.ROLE}-${requiredRoleName}`);
    if (!role) {
        role = await findRoleByName(requiredRoleName);
        if (!role) {
            winston.error('roleService.checkRole -- role not found');
            return false;
        }
        setInCache(`${Cache.ROLE}-${requiredRoleName}`, role);
    }

    if (!role.ancestors || !role.ancestors.length) {
        return false;
    }

    let result = false;
    role.ancestors.forEach(r => {
        if (userRoles.includes(r)) {
            result = true;
        }
    });
    winston.debug('roleService.checkRole -- success');
    return !!result;
};

module.exports = {
    addNewRole,
    checkRole,
};
