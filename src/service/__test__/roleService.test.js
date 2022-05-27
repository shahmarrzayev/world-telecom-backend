jest.mock('winston');
jest.mock('../../repository/roleRepository');
jest.mock('../../utils/cacheUtils');

const { addNewRole, checkRole } = require('../roleService');
const { GeneralException, NotFoundException } = require('../../exceptions');
const { UserRole } = require('../../enums');
const { findRoleByName, saveRole } = require('../../repository/roleRepository');
const { flushCache, getFromCache, setInCache } = require('../../utils/cacheUtils');

afterEach(() => {
    jest.clearAllMocks();
});

describe('roleService', () => {
    describe('addNewRole', () => {
        beforeEach(() => {
            findRoleByName.mockReturnValue(Promise.resolve({ ancestors: ['ancestor'] }));
            flushCache.mockImplementation(() => {});
            saveRole.mockReturnValue(Promise.resolve('savedRoleEntity'));
        });

        test('success - no ancestor', async () => {
            const result = await addNewRole('role', 'user');

            expect(result).toBe('savedRoleEntity');
            expect(findRoleByName).toHaveBeenCalledTimes(0);
            expect(saveRole).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('success - with ancestor', async () => {
            const result = await addNewRole({ name: 'roleName', ancestor: 'roleAncestor' }, 'user');

            expect(result).toBe('savedRoleEntity');
            expect(findRoleByName).toHaveBeenCalledTimes(1);
            expect(saveRole).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when role param not defined', async () => {
            await expect(addNewRole(null, 'user')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when user param not defined', async () => {
            await expect(addNewRole('role')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when ancestor role not found', async () => {
            findRoleByName.mockReturnValue(Promise.resolve(null));

            await expect(addNewRole({ name: 'roleName', ancestor: 'roleAncestor' }, 'user')).rejects.toEqual(
                expect.any(NotFoundException)
            );
        });

        test('throws not found exception when ancestor role not found', async () => {
            saveRole.mockReturnValue(Promise.resolve(null));

            await expect(addNewRole({ name: 'roleName', ancestor: 'roleAncestor' }, 'user')).rejects.toEqual(
                expect.any(GeneralException)
            );
        });
    });

    describe('checkRole', () => {
        beforeEach(() => {
            getFromCache.mockReturnValue({ ancestors: [UserRole.ADMIN] });
            setInCache.mockImplementation(() => {});
        });

        test('success - user roles includes required role', async () => {
            const userRoles = [UserRole.ADMIN, UserRole.ACCOUNTANT];

            const result = await checkRole(userRoles, UserRole.ACCOUNTANT);

            expect(result).toBe(true);
            expect(getFromCache).toHaveBeenCalledTimes(0);
            expect(findRoleByName).toHaveBeenCalledTimes(0);
            expect(setInCache).toHaveBeenCalledTimes(0);
        });

        test('success - required role is user roles ancestor (cache)', async () => {
            const userRoles = [UserRole.ADMIN];

            const result = await checkRole(userRoles, UserRole.ACCOUNTANT);

            expect(result).toBe(true);
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findRoleByName).toHaveBeenCalledTimes(0);
            expect(setInCache).toHaveBeenCalledTimes(0);
        });

        test('success - required role is user roles ancestor (db)', async () => {
            getFromCache.mockReturnValue(null);
            findRoleByName.mockReturnValue(Promise.resolve({ ancestors: [UserRole.ADMIN] }));
            const userRoles = [UserRole.ADMIN];

            const result = await checkRole(userRoles, UserRole.ACCOUNTANT);

            expect(result).toBe(true);
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findRoleByName).toHaveBeenCalledTimes(1);
            expect(setInCache).toHaveBeenCalledTimes(1);
        });

        test('returns false when ancestors do not have required role', async () => {
            getFromCache.mockReturnValue(null);
            findRoleByName.mockReturnValue(Promise.resolve({ ancestors: [UserRole.PRODUCT_MANAGER] }));
            const userRoles = [UserRole.ADMIN];

            const result = await checkRole(userRoles, UserRole.ACCOUNTANT);

            expect(result).toBe(false);
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findRoleByName).toHaveBeenCalledTimes(1);
            expect(setInCache).toHaveBeenCalledTimes(1);
        });

        test('returns false when userRoles param not defined', async () => {
            const result = await checkRole(null, UserRole.ACCOUNTANT);

            expect(result).toBe(false);
        });

        test('returns false when userRoles param is empty array', async () => {
            const result = await checkRole([], UserRole.ACCOUNTANT);

            expect(result).toBe(false);
        });

        test('returns false when requiredRoleName param not defined', async () => {
            const result = await checkRole([UserRole.ADMIN]);

            expect(result).toBe(false);
        });

        test('returns false when role not found in db', async () => {
            getFromCache.mockReturnValue(null);
            findRoleByName.mockReturnValue(Promise.resolve(null));
            const userRoles = [UserRole.ADMIN];

            const result = await checkRole(userRoles, UserRole.ACCOUNTANT);

            expect(result).toBe(false);
        });

        test('returns false when role has no ancestors', async () => {
            getFromCache.mockReturnValue(null);
            findRoleByName.mockReturnValue(Promise.resolve({ ancestors: [] }));
            const userRoles = [UserRole.ADMIN];

            const result = await checkRole(userRoles, UserRole.ACCOUNTANT);

            expect(result).toBe(false);
        });
    });
});
