jest.mock('winston');
jest.mock('../../mapper/loanMapper');
jest.mock('../../repository/loanRepository');
jest.mock('../../repository/productOptionRepository');
jest.mock('../../utils/cacheUtils');

const { addNewLoan, getAllLoans, modifyLoan, removeManyLoans } = require('../loanService');
const { ConflictException, GeneralException, NotFoundException } = require('../../exceptions');
const { mapLoanViewToLoanEntity } = require('../../mapper/loanMapper');
const {
    deleteManyLoans,
    findAllLoans,
    findLoanByTitle,
    findLoansInIds,
    saveLoan,
    updateLoan,
} = require('../../repository/loanRepository');
const {
    deleteLoansFromProductOptions,
    updateLoanInProductOptions,
} = require('../../repository/productOptionRepository');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    deleteLoansFromProductOptions.mockReturnValue(Promise.resolve('deleted'));
    deleteManyLoans.mockReturnValue(Promise.resolve('deleted'));
    findAllLoans.mockReturnValue(['loan1', 'loan2']);
    findLoanByTitle.mockReturnValue(Promise.resolve(null));
    findLoansInIds.mockReturnValue(Promise.resolve(['loan1', 'loan2']));
    mapLoanViewToLoanEntity.mockReturnValue('loanEntity');
    saveLoan.mockReturnValue(Promise.resolve('savedLoanEntity'));
    updateLoan.mockReturnValue(Promise.resolve('updatedLoanEntity'));
    updateLoanInProductOptions.mockReturnValue(Promise.resolve('updated'));
});

describe('loanService', () => {
    describe('addNewLoan', () => {
        test('success', async () => {
            const result = await addNewLoan('loanView', 'userId');

            expect(result).toBe('savedLoanEntity');
            expect(findLoanByTitle).toHaveBeenCalledTimes(1);
            expect(mapLoanViewToLoanEntity).toHaveBeenCalledTimes(1);
            expect(saveLoan).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when loanView param is null', async () => {
            await expect(addNewLoan(null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when userId param is null', async () => {
            await expect(addNewLoan('loanView', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws conflict exception when loan with such title already exists', async () => {
            findLoanByTitle.mockReturnValue(Promise.resolve('loanEntity'));

            await expect(addNewLoan('loanView', 'userId')).rejects.toEqual(expect.any(ConflictException));
        });

        test('throws general exception when saved loan is not defined', async () => {
            saveLoan.mockReturnValue(Promise.resolve(null));

            await expect(addNewLoan('loanView', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getAllLoans', () => {
        test('success', async () => {
            const result = await getAllLoans();

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(findAllLoans).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when cannot get loans', async () => {
            findAllLoans.mockReturnValue(Promise.resolve(null));

            await expect(getAllLoans()).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('modifyLoan', () => {
        test('success', async () => {
            const result = await modifyLoan('id', 'loanView', 'userId');

            expect(result).toBe('updatedLoanEntity');
            expect(mapLoanViewToLoanEntity).toHaveBeenCalledTimes(1);
            expect(updateLoan).toHaveBeenCalledTimes(1);
            expect(updateLoanInProductOptions).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(modifyLoan(null, 'loanView', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when loanView param not defined', async () => {
            await expect(modifyLoan('id', null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when userId param not defined', async () => {
            await expect(modifyLoan('id', 'loanView', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when title name is Daxili kredit', async () => {
            await expect(modifyLoan('id', { title: 'Daxili kredit' }, 'userId')).rejects.toEqual(
                expect.any(GeneralException)
            );
        });

        test('throws general exception when updated entity is null', async () => {
            updateLoan.mockReturnValue(Promise.resolve(null));

            await expect(modifyLoan('id', 'loanView', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot update loan in product options', async () => {
            updateLoanInProductOptions.mockReturnValue(Promise.resolve(null));

            await expect(modifyLoan('id', 'loanView', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('removeManyLoans', () => {
        test('success', async () => {
            await removeManyLoans(['loan1', 'loan2']);

            expect(findLoansInIds).toHaveBeenCalledTimes(1);
            expect(deleteManyLoans).toHaveBeenCalledTimes(1);
            expect(deleteLoansFromProductOptions).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when ids is not defined', async () => {
            await expect(removeManyLoans()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when ids empty array', async () => {
            await expect(removeManyLoans([])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when findLoansInIds returns null', async () => {
            findLoansInIds.mockReturnValue(Promise.resolve(null));

            await expect(removeManyLoans(['loan1', 'loan2'])).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws not found exception when not all loans found', async () => {
            findLoansInIds.mockReturnValue(Promise.resolve(['loan1']));

            await expect(removeManyLoans(['loan1', 'loan2'])).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws general exception when cannot delete loans', async () => {
            deleteManyLoans.mockReturnValue(Promise.resolve(null));

            await expect(removeManyLoans(['loan1', 'loan2'])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete loans from product options', async () => {
            deleteLoansFromProductOptions.mockReturnValue(Promise.resolve(null));

            await expect(removeManyLoans(['loan1', 'loan2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
