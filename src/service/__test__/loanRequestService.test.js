jest.mock('winston');
jest.mock('../helper/loanRequestHelper');
jest.mock('../../repository/loanRequestRepository');

const {
    createLoanRequestForNumbers,
    createLoanRequestForProducts,
    getFilterParamsFromRequestQuery,
} = require('../helper/loanRequestHelper');
const {
    addNewLoanRequest,
    approveLoanRequest,
    closeLoanRequest,
    getLoanRequestById,
    getManyLoanRequests,
} = require('../loanRequestService');
const { GeneralException, NotFoundException } = require('../../exceptions');
const {
    countLoanRequests,
    findLoanRequestById,
    findManyLoanRequests,
    saveLoanRequest,
    updateLoanRequest,
} = require('../../repository/loanRequestRepository');

let loanRequestView;

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    loanRequestView = {
        orderedNumber: null,
        orderedProductOption: null,
    };

    countLoanRequests.mockReturnValue(Promise.resolve(2));
    createLoanRequestForNumbers.mockReturnValue(Promise.resolve('loanRequestEntity'));
    createLoanRequestForProducts.mockReturnValue(Promise.resolve('loanRequestEntity'));
    findLoanRequestById.mockReturnValue(Promise.resolve({ status: 'PENDING' }));
    findManyLoanRequests.mockReturnValue(Promise.resolve({ query: 'query', loanRequests: ['r1', 'r2'] }));
    getFilterParamsFromRequestQuery.mockReturnValue('filterParams');
    saveLoanRequest.mockReturnValue(Promise.resolve('savedLoanRequestEntity'));
    updateLoanRequest.mockReturnValue(Promise.resolve('updatedLoanRequestEntity'));
});

describe('loanRequestService', () => {
    describe('addNewLoanRequest', () => {
        test('success -- product', async () => {
            loanRequestView.orderedProductOption = 'orderedProductOption';

            const result = await addNewLoanRequest(loanRequestView);

            expect(result).toBe('savedLoanRequestEntity');
            expect(createLoanRequestForProducts).toHaveBeenCalledTimes(1);
            expect(createLoanRequestForNumbers).toHaveBeenCalledTimes(0);
            expect(saveLoanRequest).toHaveBeenCalledTimes(1);
        });

        test('success -- number', async () => {
            loanRequestView.orderedNumber = 'orderedNumber';

            const result = await addNewLoanRequest(loanRequestView);

            expect(result).toBe('savedLoanRequestEntity');
            expect(createLoanRequestForProducts).toHaveBeenCalledTimes(0);
            expect(createLoanRequestForNumbers).toHaveBeenCalledTimes(1);
            expect(saveLoanRequest).toHaveBeenCalledTimes(1);
        });

        test('success -- number: orderedProductOption is empty object', async () => {
            loanRequestView.orderedNumber = 'orderedNumber';
            loanRequestView.orderedProductOption = {};

            const result = await addNewLoanRequest(loanRequestView);

            expect(result).toBe('savedLoanRequestEntity');
            expect(createLoanRequestForProducts).toHaveBeenCalledTimes(0);
            expect(createLoanRequestForNumbers).toHaveBeenCalledTimes(1);
            expect(saveLoanRequest).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when loanRequest param is not defined', async () => {
            await expect(addNewLoanRequest()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when both orderedProductOption and orderedNumber are defined', async () => {
            loanRequestView.orderedNumber = 'orderedNumber';
            loanRequestView.orderedProductOption = 'orderedProductOption';

            await expect(addNewLoanRequest(loanRequestView)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when saved loan entity is null', async () => {
            loanRequestView.orderedProductOption = 'orderedProductOption';
            saveLoanRequest.mockReturnValue(Promise.resolve(null));

            await expect(addNewLoanRequest(loanRequestView)).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('approveLoanRequest', () => {
        test('success', async () => {
            await approveLoanRequest('id');

            expect(findLoanRequestById).toHaveBeenCalledTimes(1);
            expect(updateLoanRequest).toHaveBeenCalledTimes(1);
        });

        test('returns when loan request is already approved', async () => {
            findLoanRequestById.mockReturnValue(Promise.resolve({ status: 'APPROVED' }));

            await approveLoanRequest('id');

            expect(findLoanRequestById).toHaveBeenCalledTimes(1);
            expect(updateLoanRequest).toHaveBeenCalledTimes(0);
        });

        test('throws general exception when id param is not defined', async () => {
            await expect(approveLoanRequest()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when loan request is not found', async () => {
            findLoanRequestById.mockReturnValue(Promise.resolve(null));

            await expect(approveLoanRequest('id')).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws general exception when cannot update loan request', async () => {
            updateLoanRequest.mockReturnValue(Promise.resolve(null));

            await expect(approveLoanRequest('id')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('closeLoanRequest', () => {
        test('success', async () => {
            await closeLoanRequest('id');

            expect(findLoanRequestById).toHaveBeenCalledTimes(1);
            expect(updateLoanRequest).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param is not defined', async () => {
            await expect(closeLoanRequest()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when loan request is not found', async () => {
            findLoanRequestById.mockReturnValue(Promise.resolve(null));

            await expect(closeLoanRequest('id')).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws general exception when cannot update loan request', async () => {
            updateLoanRequest.mockReturnValue(Promise.resolve(null));

            await expect(closeLoanRequest('id')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getLoanRequestById', () => {
        test('success', async () => {
            const result = await getLoanRequestById('id');

            expect(result).toBeDefined();
            expect(result.status).toBe('PENDING');
            expect(findLoanRequestById).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param is not defined', async () => {
            await expect(getLoanRequestById()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when loan request not found', async () => {
            findLoanRequestById.mockReturnValue(Promise.resolve(null));

            await expect(getLoanRequestById('id')).rejects.toEqual(expect.any(NotFoundException));
        });
    });

    describe('getManyLoanRequests', () => {
        test('success', async () => {
            const result = await getManyLoanRequests('query');

            expect(result).toBeDefined();
            expect(result.loanRequests.length).toBe(2);
            expect(getFilterParamsFromRequestQuery).toHaveBeenCalledTimes(1);
            expect(findManyLoanRequests).toHaveBeenCalledTimes(1);
            expect(countLoanRequests).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when requestQuery param is not defined', async () => {
            await expect(getManyLoanRequests()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when count returns null', async () => {
            countLoanRequests.mockReturnValue(Promise.resolve(null));

            await expect(getManyLoanRequests('query')).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
