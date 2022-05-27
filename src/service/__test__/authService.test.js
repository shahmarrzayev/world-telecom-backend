jest.mock('winston');
jest.mock('../helper/authHelper');
jest.mock('../../repository/userRepository');

const { login, refreshToken } = require('../authService');
const { GeneralException, UnauthorizedException } = require('../../exceptions');
const { generateToken, setAuthHeaders, verifyPassword, verifyRefreshToken } = require('../helper/authHelper');
const { findUserByEmail, findUserById } = require('../../repository/userRepository');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    findUserByEmail.mockReturnValue(Promise.resolve('userEntity'));
    findUserById.mockReturnValue(Promise.resolve('userEntity'));
    generateToken.mockReturnValue('token');
    setAuthHeaders.mockReturnValue(true);
    verifyPassword.mockReturnValue(Promise.resolve(true));
    verifyRefreshToken.mockReturnValue({ data: { email: 'email', id: 'id' } });
});

describe('authService', () => {
    describe('login', () => {
        test('success', async () => {
            const result = await login('res', { email: 'email', password: 'password' });

            expect(result).toBe('userEntity');
            expect(findUserByEmail).toHaveBeenCalledTimes(1);
            expect(verifyPassword).toHaveBeenCalledTimes(1);
            expect(generateToken).toHaveBeenCalledTimes(2);
            expect(setAuthHeaders).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when loginView is not provided', async () => {
            await expect(login('res', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when email is not provided', async () => {
            await expect(login('res', { email: null, password: 'password' })).rejects.toEqual(
                expect.any(GeneralException)
            );
        });

        test('throws general exception when password is not provided', async () => {
            await expect(login('res', { email: 'email', password: null })).rejects.toEqual(
                expect.any(GeneralException)
            );
        });

        test('throws unauthorized exception when user not found', async () => {
            findUserByEmail.mockReturnValue(Promise.resolve(null));

            await expect(login('res', { email: 'email', password: 'password' })).rejects.toEqual(
                expect.any(UnauthorizedException)
            );
        });

        test('throws unauthorized exception when cannot verify password', async () => {
            verifyPassword.mockReturnValue(Promise.resolve(null));

            await expect(login('res', { email: 'email', password: 'password' })).rejects.toEqual(
                expect.any(UnauthorizedException)
            );
        });

        test('throws general exception when cannot generate access token', async () => {
            generateToken.mockReturnValue(null);

            await expect(login('res', { email: 'email', password: 'password' })).rejects.toEqual(
                expect.any(GeneralException)
            );
        });

        test('throws general exception when cannot generate refresh token', async () => {
            generateToken.mockImplementation((id, email, isRefresh) => {
                if (isRefresh) return null;
                return 'token';
            });

            await expect(login('res', { email: 'email', password: 'password' })).rejects.toEqual(
                expect.any(GeneralException)
            );
        });

        test('throws general exception when cannot set auth headers', async () => {
            setAuthHeaders.mockReturnValue(null);

            await expect(login('res', { email: 'email', password: 'password' })).rejects.toEqual(
                expect.any(GeneralException)
            );
        });
    });

    describe('refreshToken', () => {
        test('success', async () => {
            const result = await refreshToken('res', 'token');

            expect(result).toBe('userEntity');
            expect(verifyRefreshToken).toHaveBeenCalledTimes(1);
            expect(findUserById).toHaveBeenCalledTimes(1);
            expect(generateToken).toHaveBeenCalledTimes(1);
            expect(setAuthHeaders).toHaveBeenCalledTimes(1);
        });

        test('throws unauthorized exception when res param is not provided', async () => {
            await expect(refreshToken(null, 'token')).rejects.toEqual(expect.any(UnauthorizedException));
        });

        test('throws unauthorized exception when token is not provided', async () => {
            await expect(refreshToken('res', null)).rejects.toEqual(expect.any(UnauthorizedException));
        });

        test('throws unauthorized exception when cannot verify token', async () => {
            verifyRefreshToken.mockReturnValue(null);

            await expect(refreshToken('res', 'token')).rejects.toEqual(expect.any(UnauthorizedException));
        });

        test('throws unauthorized exception when user not found', async () => {
            findUserById.mockReturnValue(Promise.resolve(null));

            await expect(refreshToken('res', 'token')).rejects.toEqual(expect.any(UnauthorizedException));
        });

        test('throws general exception when cannot generate token', async () => {
            generateToken.mockReturnValue(null);

            await expect(refreshToken('res', 'token')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot set auth headers', async () => {
            setAuthHeaders.mockReturnValue(null);

            await expect(refreshToken('res', 'token')).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
