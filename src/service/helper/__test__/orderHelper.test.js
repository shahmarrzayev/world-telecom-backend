jest.mock('winston');
jest.mock('../../../mapper/orderMapper');
jest.mock('../../../repository/numberRepository');

const { assignOrderedNumbers } = require('../orderHelper');
const { mapNumberEntitiesToOrderedNumbers } = require('../../../mapper/orderMapper');
const { findManyNumbersByIds } = require('../../../repository/numberRepository');

afterEach(() => {
    jest.clearAllMocks();
});

describe('orderHelper', () => {
    describe('assigOrderedNumbers', () => {
        beforeEach(() => {
            findManyNumbersByIds.mockReturnValue(Promise.resolve(['n1', 'n2']));
            mapNumberEntitiesToOrderedNumbers.mockReturnValue('orderedNumberEntities');
        });

        test('success - no campaigns', async () => {
            const result = await assignOrderedNumbers(['n1', 'n2'], []);

            expect(result).toBe('orderedNumberEntities');
            expect(findManyNumbersByIds).toHaveBeenCalledTimes(1);
            expect(mapNumberEntitiesToOrderedNumbers).toHaveBeenCalledTimes(1);
        });

        test('returns null when orderedNumbers param not defined', async () => {
            const result = await assignOrderedNumbers(null, []);

            expect(result).toBe(null);
            expect(findManyNumbersByIds).toHaveBeenCalledTimes(0);
        });

        test('return null when orderedNumbers param empty array', async () => {
            const result = await assignOrderedNumbers([], []);

            expect(result).toBe(null);
            expect(findManyNumbersByIds).toHaveBeenCalledTimes(0);
        });

        test('return null when campaigns param not defined', async () => {
            const result = await assignOrderedNumbers([]);

            expect(result).toBe(null);
            expect(findManyNumbersByIds).toHaveBeenCalledTimes(0);
        });

        test('return null when not all numbers found', async () => {
            findManyNumbersByIds.mockReturnValue(Promise.resolve(['n1']));

            const result = await assignOrderedNumbers(['n1', 'n2'], []);

            expect(result).toBe(null);
        });
    });
});
