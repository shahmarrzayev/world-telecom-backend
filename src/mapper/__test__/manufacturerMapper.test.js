const {
    mapManufacturerEntityToManufacturerView,
    mapManufacturerViewToManufacturerEntity,
} = require('../manufacturerMapper');

const manufacturerMock = {
    _id: '_id',
    name: 'name',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    unknownParam: 'unknownParam',
};

describe('manufacturerMapper', () => {
    describe('mapManufacturerEntityToManufacturerView', () => {
        test('success', () => {
            const result = mapManufacturerEntityToManufacturerView(manufacturerMock);

            expect(result).toBeDefined();
            expect(result._id).toBe(manufacturerMock._id);
            expect(result.name).toBe(manufacturerMock.name);
            expect(result.createdAt).toBe(manufacturerMock.createdAt);

            expect(result.createdBy).not.toBeDefined();
            expect(result.updatedAt).not.toBeDefined();
            expect(result.updatedBy).not.toBeDefined();
            expect(result.unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is not defined', () => {
            const result = mapManufacturerEntityToManufacturerView();

            expect(result).toBeNull();
        });
    });

    describe('mapManufacturerViewToManufacturerEntity', () => {
        test('success', () => {
            const result = mapManufacturerViewToManufacturerEntity(manufacturerMock);

            expect(result.name).toBe(manufacturerMock.name);

            expect(result._id).not.toBeDefined();
            expect(result.createdAt).not.toBeDefined();
            expect(result.createdBy).not.toBeDefined();
            expect(result.updatedAt).not.toBeDefined();
            expect(result.updatedBy).not.toBeDefined();
            expect(result.unknownParam).not.toBeDefined();
        });

        test('returns null when view param is not defined', () => {
            const result = mapManufacturerViewToManufacturerEntity();

            expect(result).toBeNull();
        });
    });
});
