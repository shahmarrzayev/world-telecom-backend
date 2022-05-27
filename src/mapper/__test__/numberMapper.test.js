const { mapNumberEntityToNumberView } = require('../numberMapper');

const numberMock = {
    _id: '_id',
    operator: 'operator',
    number: 'number',
    price: 'price',
    loanPrice: 'loanPrice',
    status: 'status',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    unknownParam: 'unknownParam',
};

describe('numberMapper', () => {
    describe('mapNumberEntityToNumberView', () => {
        test('success', () => {
            const result = mapNumberEntityToNumberView(numberMock);

            expect(result).toBeDefined();
            expect(result._id).toBe(numberMock._id);
            expect(result.operator).toBe(numberMock.operator);
            expect(result.number).toBe(numberMock.number);
            expect(result.price).toBe(numberMock.price);
            expect(result.loanPrice).toBe(numberMock.loanPrice);
            expect(result.status).toBe(numberMock.status);

            expect(result.createdAt).not.toBeDefined();
            expect(result.createdBy).not.toBeDefined();
            expect(result.updatedAt).not.toBeDefined();
            expect(result.updatedBy).not.toBeDefined();
            expect(result.unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is not defined', () => {
            const result = mapNumberEntityToNumberView();

            expect(result).toBeNull();
        });
    });
});
