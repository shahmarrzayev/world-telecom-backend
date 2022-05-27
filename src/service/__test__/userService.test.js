jest.mock('winston');
jest.mock('../helper/authHelper');
jest.mock('../../repository/userRepository');
jest.mock('../../utils/cacheUtils');

const { addUser, changePassword, getAllUsers, getUserById } = require('../userService');
const { hashPassword, verifyPassword } = require('../helper/authHelper');
const {
    BadRequestException,
    ConflictException,
    GeneralException,
    NotFoundException,
    UnauthorizedException,
} = require('../../exceptions');
const { findAllUsers, findUserByEmail, findUserById, saveUser } = require('../../repository/userRepository');
const { getFromCache, flushCache, setInCache } = require('../../utils/cacheUtils');

afterEach(() => {
    jest.clearAllMocks();
});

describe('userService', () => {
    describe('addUser', () => {
        beforeEach(() => {
            findUserByEmail.mockReturnValue(Promise.resolve(null));
            flushCache.mockImplementation(() => {});
            hashPassword.mockReturnValue(Promise.resolve('hashedPassword'));
            saveUser.mockReturnValue(Promise.resolve('savedUserEntity'));
        });

        test('success', async () => {
            const result = await addUser('userView');

            expect(result).toBe('savedUserEntity');
            expect(findUserByEmail).toHaveBeenCalledTimes(1);
            expect(hashPassword).toHaveBeenCalledTimes(1);
            expect(saveUser).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when userView param not defined', async () => {
            await expect(addUser()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws conflict exception when user with such mail already exists', async () => {
            findUserByEmail.mockReturnValue(Promise.resolve('userEntity'));

            await expect(addUser('userView')).rejects.toEqual(expect.any(ConflictException));
        });

        test('throws general exception when cannot hash password', async () => {
            hashPassword.mockReturnValue(Promise.resolve(null));

            await expect(addUser('userView')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot save user', async () => {
            saveUser.mockReturnValue(Promise.resolve(null));

            await expect(addUser('userView')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('changePassword', () => {
        beforeEach(() => {
            findUserById.mockReturnValue(Promise.resolve({ password: 'password' }));
            flushCache.mockImplementation(() => {});
            hashPassword.mockReturnValue(Promise.resolve('hashedPassword'));
            saveUser.mockReturnValue(Promise.resolve('savedUserEntity'));
            verifyPassword.mockReturnValue(Promise.resolve(true));
        });

        test('success', async () => {
            const result = await changePassword('id', 'oldPassword', 'newPassword');

            expect(result).toBe('savedUserEntity');
            expect(findUserById).toHaveBeenCalledTimes(1);
            expect(verifyPassword).toHaveBeenCalledTimes(1);
            expect(hashPassword).toHaveBeenCalledTimes(1);
            expect(saveUser).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(changePassword(null, 'oldPwd', 'newPwd')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when oldPassword param not defined', async () => {
            await expect(changePassword('id', null, 'newPwd')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when newPassword param not defined', async () => {
            await expect(changePassword('id', 'newPwd')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws bad request exception when old password equals new password', async () => {
            await expect(changePassword('id', 'newPwd', 'newPwd')).rejects.toEqual(expect.any(BadRequestException));
        });

        test('throws not found exception when cannot find user', async () => {
            findUserById.mockReturnValue(Promise.resolve(null));

            await expect(changePassword('id', 'oldPwd', 'newPwd')).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws unauthorized exception when cannot find user', async () => {
            verifyPassword.mockReturnValue(Promise.resolve(false));

            await expect(changePassword('id', 'oldPwd', 'newPwd')).rejects.toEqual(expect.any(UnauthorizedException));
        });

        test('throws general exception when cannot hash password', async () => {
            hashPassword.mockReturnValue(Promise.resolve(null));

            await expect(changePassword('id', 'oldPwd', 'newPwd')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot save user', async () => {
            saveUser.mockReturnValue(Promise.resolve(null));

            await expect(changePassword('id', 'oldPwd', 'newPwd')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getAllUsers', () => {
        beforeEach(() => {
            findAllUsers.mockReturnValue(Promise.resolve(['user1', 'user2']));
        });

        test('success', async () => {
            const result = await getAllUsers();

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
        });

        test('throws general exception when cannot get users', async () => {
            findAllUsers.mockReturnValue(Promise.resolve(null));

            await expect(getAllUsers()).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getUserById', () => {
        beforeEach(() => {
            findUserById.mockReturnValue(Promise.resolve('userEntity'));
            getFromCache.mockReturnValue('userEntity');
            setInCache.mockImplementation(() => {});
        });

        test('success - hits cache', async () => {
            const result = await getUserById('id');

            expect(result).toBe('userEntity');
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findUserById).toHaveBeenCalledTimes(0);
            expect(setInCache).toHaveBeenCalledTimes(0);
        });

        test('success - db', async () => {
            getFromCache.mockReturnValue(null);

            const result = await getUserById('id');

            expect(result).toBe('userEntity');
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findUserById).toHaveBeenCalledTimes(1);
            expect(setInCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(getUserById()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when user not found', async () => {
            getFromCache.mockReturnValue(null);
            findUserById.mockReturnValue(Promise.resolve(null));

            await expect(getUserById('id')).rejects.toEqual(expect.any(NotFoundException));
        });
    });
});
