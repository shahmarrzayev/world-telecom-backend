jest.mock('winston');
jest.mock('../../repository/branchRepository');
jest.mock('../../utils/cacheUtils');

const { addNewBranch, getAllBranches, modifyBranch, removeManyBranches } = require('../branchService');
const { ConflictException, GeneralException, NotFoundException } = require('../../exceptions');
const {
    deleteManyBranches,
    findAllBranches,
    findBranchByName,
    saveBranch,
    updateBranch,
} = require('../../repository/branchRepository');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    deleteManyBranches.mockReturnValue(Promise.resolve('deleted'));
    findAllBranches.mockReturnValue(Promise.resolve(['branch1', 'branch2']));
    findBranchByName.mockReturnValue(Promise.resolve(null));
    saveBranch.mockReturnValue(Promise.resolve('savedBranchEntity'));
    updateBranch.mockReturnValue(Promise.resolve('updatedBranchEntity'));
});

describe('branchService', () => {
    describe('addNewBranch', () => {
        test('success', async () => {
            const result = await addNewBranch('branch', 'userId');

            expect(result).toBe('savedBranchEntity');
            expect(findBranchByName).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when branch param is null', async () => {
            await expect(addNewBranch(null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when userId param is null', async () => {
            await expect(addNewBranch('branch', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws conflict exception when branch with such name already exists', async () => {
            findBranchByName.mockReturnValue(Promise.resolve('branchEntity'));

            await expect(addNewBranch('branch', 'userId')).rejects.toEqual(expect.any(ConflictException));
        });

        test('throws general exception when cannot save branch', async () => {
            saveBranch.mockReturnValue(Promise.resolve(null));

            await expect(addNewBranch('branch', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getAllBranches', () => {
        test('success', async () => {
            const result = await getAllBranches();

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
        });

        test('throws general exception when cannot get branches', async () => {
            findAllBranches.mockReturnValue(Promise.resolve(null));

            await expect(getAllBranches()).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('modifyBranch', () => {
        test('success', async () => {
            const result = await modifyBranch('id', 'branch', 'userId');

            expect(result).toBe('updatedBranchEntity');
            expect(updateBranch).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param is null', async () => {
            await expect(modifyBranch(null, 'branch', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when branch param is null', async () => {
            await expect(modifyBranch('id', null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when userId param is null', async () => {
            await expect(modifyBranch('id', 'branch', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when updated branch entity is null', async () => {
            updateBranch.mockReturnValue(Promise.resolve(null));

            await expect(modifyBranch('id', 'branch', 'userId')).rejects.toEqual(expect.any(NotFoundException));
        });
    });

    describe('removeManyBranches', () => {
        test('success', async () => {
            await removeManyBranches(['branchId1', 'branchId2']);

            expect(deleteManyBranches).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when branchIds param is null', async () => {
            await expect(removeManyBranches()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when branchIds param is empty array', async () => {
            await expect(removeManyBranches([])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete branches', async () => {
            deleteManyBranches.mockReturnValue(Promise.resolve(null));

            await expect(removeManyBranches(['branchId1', 'branchId2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
