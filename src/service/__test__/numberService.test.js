jest.mock('winston');
jest.mock('../helper/numberHelper');
jest.mock('../../mapper/numberMapper');
jest.mock('../../repository/numberRepository');

const { getFilterParamsFromRequestQuery } = require('../helper/numberHelper');
const {
    addManyNumbers,
    addNumber,
    deleteNumbersByIds,
    getManyNumbers,
    getManyNumbersByIds,
    modifyNumber,
} = require('../numberService');
const { ConflictException, GeneralException, NotFoundException } = require('../../exceptions');
const { mapNumberViewToNumberEntity } = require('../../mapper/numberMapper');
const {
    countNumbers,
    findManyNumbers,
    findManyNumbersByIds,
    findNumberByOperatorAndNumber,
    deleteAllNumbers,
    deleteManyNumbersByIds,
    saveManyNumbers,
    saveNumber,
    updateNumber,
} = require('../../repository/numberRepository');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    countNumbers.mockReturnValue(Promise.resolve(2));
    deleteAllNumbers.mockReturnValue(Promise.resolve('deleted'));
    deleteManyNumbersByIds.mockReturnValue(Promise.resolve('deleted'));
    findManyNumbers.mockReturnValue(Promise.resolve({ query: 'query', numbers: ['number1', 'number2'] }));
    findManyNumbersByIds.mockReturnValue(Promise.resolve(['number1', 'number2']));
    findNumberByOperatorAndNumber.mockReturnValue(Promise.resolve(null));
    getFilterParamsFromRequestQuery.mockReturnValue('filterParams');
    mapNumberViewToNumberEntity.mockReturnValue('numberEntity');
    saveManyNumbers.mockReturnValue(Promise.resolve('saved'));
    saveNumber.mockReturnValue(Promise.resolve('savedNumberEntity'));
    updateNumber.mockReturnValue(Promise.resolve('updatedNumberEntity'));
});

describe('numberService', () => {
    describe('addManyNumbers', () => {
        test('success', async () => {
            await addManyNumbers(['number1', 'number2']);

            expect(deleteAllNumbers).toHaveBeenCalledTimes(1);
            expect(saveManyNumbers).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when numbers param not defined', async () => {
            await expect(addManyNumbers()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when numbers param is empty array', async () => {
            await expect(addManyNumbers([])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete numbers', async () => {
            deleteAllNumbers.mockReturnValue(Promise.resolve(null));

            await expect(addManyNumbers(['number1', 'number2'])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot save numbers', async () => {
            saveManyNumbers.mockReturnValue(Promise.resolve(null));

            await expect(addManyNumbers(['number1', 'number2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('addNumber', () => {
        test('success', async () => {
            const result = await addNumber('numberView', 'user');

            expect(result).toBe('savedNumberEntity');
        });

        test('throws general exception when numberView param not defined', async () => {
            await expect(addNumber(null, 'user')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when user param not defined', async () => {
            await expect(addNumber('view')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws conflict exception when number already exists', async () => {
            findNumberByOperatorAndNumber.mockReturnValue(Promise.resolve('numberEntity'));

            await expect(addNumber('view', 'user')).rejects.toEqual(expect.any(ConflictException));
        });

        test('throws general exception when cannot map view to entity', async () => {
            mapNumberViewToNumberEntity.mockReturnValue(null);

            await expect(addNumber('view', 'user')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot save number', async () => {
            saveNumber.mockReturnValue(Promise.resolve(null));

            await expect(addNumber('view', 'user')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('deleteNumbersByIds', () => {
        test('success', async () => {
            await deleteNumbersByIds(['id1', 'id2']);

            expect(deleteManyNumbersByIds).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when ids param not defined', async () => {
            await expect(deleteNumbersByIds()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when ids param is empty array', async () => {
            await expect(deleteNumbersByIds([])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete ids', async () => {
            deleteManyNumbersByIds.mockReturnValue(Promise.resolve(null));

            await expect(deleteNumbersByIds(['id1', 'id2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getManyNumbers', () => {
        test('success', async () => {
            const result = await getManyNumbers('requestQuery');

            expect(result).toBeDefined();
            expect(result.numbers).toBeDefined();
            expect(result.numbers.length).toBe(2);
            expect(result.total).toBeDefined();
            expect(result.total).toBe(2);
            expect(getFilterParamsFromRequestQuery).toHaveBeenCalledTimes(1);
            expect(findManyNumbers).toHaveBeenCalledTimes(1);
            expect(countNumbers).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when requestQuery param not defined', async () => {
            await expect(getManyNumbers()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot get filter params', async () => {
            getFilterParamsFromRequestQuery.mockReturnValue(null);

            await expect(getManyNumbers(['id1', 'id2'])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot find numbers', async () => {
            findManyNumbers.mockReturnValue(Promise.resolve(null));

            await expect(getManyNumbers(['id1', 'id2'])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when returned query is null', async () => {
            findManyNumbers.mockReturnValue(Promise.resolve({ query: null, numbers: ['number1', 'number2'] }));

            await expect(getManyNumbers(['id1', 'id2'])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when returned numbers is null', async () => {
            findManyNumbers.mockReturnValue(Promise.resolve({ query: 'query', numbers: null }));

            await expect(getManyNumbers(['id1', 'id2'])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot count numbers', async () => {
            countNumbers.mockReturnValue(Promise.resolve(null));

            await expect(getManyNumbers(['id1', 'id2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getManyNumbersByIds', () => {
        test('success', async () => {
            const result = await getManyNumbersByIds(['id1', 'id2']);

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
        });

        test('throws general exception when ids param not defined', async () => {
            await expect(getManyNumbersByIds()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when ids param is empty array', async () => {
            await expect(getManyNumbersByIds([])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when ids param is empty array', async () => {
            findManyNumbersByIds.mockReturnValue(Promise.resolve(null));

            await expect(getManyNumbersByIds(['id1', 'id2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('modifyNumber', () => {
        test('success', async () => {
            const result = await modifyNumber('id', 'numberView');

            expect(result).toBe('updatedNumberEntity');
            expect(updateNumber).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(modifyNumber(null, 'numberView')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when numberView param not defined', async () => {
            await expect(modifyNumber('id', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot update number', async () => {
            updateNumber.mockReturnValue(Promise.resolve(null));

            await expect(modifyNumber('id', 'numberView')).rejects.toEqual(expect.any(NotFoundException));
        });
    });
});
