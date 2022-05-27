jest.mock('winston');
jest.mock('../../mapper/manufacturerMapper');
jest.mock('../../repository/manufacturerRepository');
jest.mock('../../repository/productRepository');
jest.mock('../../utils/cacheUtils');

const {
    addNewManufacturer,
    getAllManufacturers,
    modifyManufacturer,
    removeManyManufacturers,
} = require('../manufacturerService');
const { ConflictException, GeneralException, NotFoundException } = require('../../exceptions');
const { mapManufacturerViewToManufacturerEntity } = require('../../mapper/manufacturerMapper');
const {
    deleteManyManufacturers,
    findAllManufacturers,
    findManufacturerByName,
    saveManufacturer,
    updateManufacturer,
} = require('../../repository/manufacturerRepository');
const { updateManufacturerInProducts } = require('../../repository/productRepository');
const { getFromCache, flushCache, setInCache } = require('../../utils/cacheUtils');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    deleteManyManufacturers.mockReturnValue(Promise.resolve('deleted'));
    findAllManufacturers.mockReturnValue(['manufacturer1', 'manufacturer2']);
    findManufacturerByName.mockReturnValue(Promise.resolve(null));
    flushCache.mockImplementation(() => {});
    getFromCache.mockReturnValue('fromCache');
    mapManufacturerViewToManufacturerEntity.mockReturnValue('manufacturerEntity');
    saveManufacturer.mockReturnValue(Promise.resolve('savedManufacturerEntity'));
    setInCache.mockImplementation(() => {});
    updateManufacturer.mockReturnValue(Promise.resolve('updatedManufacturerEntity'));
    updateManufacturerInProducts.mockReturnValue(Promise.resolve('updated'));
});

describe('manufacturerService', () => {
    describe('addNewManufacturer', () => {
        test('success', async () => {
            const result = await addNewManufacturer('manufacturerView', 'userId');

            expect(result).toBe('savedManufacturerEntity');
            expect(findManufacturerByName).toHaveBeenCalledTimes(1);
            expect(mapManufacturerViewToManufacturerEntity).toHaveBeenCalledTimes(1);
            expect(saveManufacturer).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when manufacturerView param is null', async () => {
            await expect(addNewManufacturer(null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when userId param is null', async () => {
            await expect(addNewManufacturer('manufacturerView', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws conflict exception when manufacturer with such name already exists', async () => {
            findManufacturerByName.mockReturnValue(Promise.resolve('manufacturerEntity'));

            await expect(addNewManufacturer('manufacturerView', 'userId')).rejects.toEqual(
                expect.any(ConflictException)
            );
        });

        test('throws general exception when cannot save manufacturer', async () => {
            saveManufacturer.mockReturnValue(Promise.resolve(null));

            await expect(addNewManufacturer('manufacturerView', 'userId')).rejects.toEqual(
                expect.any(GeneralException)
            );
        });
    });

    describe('getAllManufacturers', () => {
        test('success -- from cache', async () => {
            const result = await getAllManufacturers();

            expect(result).toBe('fromCache');
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findAllManufacturers).toHaveBeenCalledTimes(0);
            expect(setInCache).toHaveBeenCalledTimes(0);
        });

        test('success -- from db', async () => {
            getFromCache.mockReturnValue(null);

            const result = await getAllManufacturers();

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findAllManufacturers).toHaveBeenCalledTimes(1);
            expect(setInCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when cannot get manufacturers', async () => {
            findAllManufacturers.mockReturnValue(Promise.resolve(null));
            getFromCache.mockReturnValue(null);

            await expect(getAllManufacturers()).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('modifyManufacturer', () => {
        test('success', async () => {
            const result = await modifyManufacturer('id', 'manufacturerView', 'userId');

            expect(result).toBe('updatedManufacturerEntity');
            expect(mapManufacturerViewToManufacturerEntity).toHaveBeenCalledTimes(1);
            expect(updateManufacturer).toHaveBeenCalledTimes(1);
            expect(updateManufacturerInProducts).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param is null', async () => {
            await expect(modifyManufacturer(null, 'view', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when manufacturerView param is null', async () => {
            await expect(modifyManufacturer('id', null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when manufacturerView param is null', async () => {
            await expect(modifyManufacturer('id', 'view', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when cannot update manufacturer', async () => {
            updateManufacturer.mockReturnValue(Promise.resolve(null));

            await expect(modifyManufacturer('id', 'view', 'userId')).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws general exception when cannot update manufacturer in products', async () => {
            updateManufacturerInProducts.mockReturnValue(Promise.resolve(null));

            await expect(modifyManufacturer('id', 'view', 'userId')).rejects.toEqual(expect.any(NotFoundException));
        });
    });

    describe('removeManyManufacturers', () => {
        test('success', async () => {
            await removeManyManufacturers(['id1', 'id2']);

            expect(deleteManyManufacturers).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when ids param is null', async () => {
            await expect(removeManyManufacturers()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when ids param is empty array', async () => {
            await expect(removeManyManufacturers([])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete manufacturers', async () => {
            deleteManyManufacturers.mockReturnValue(Promise.resolve(null));

            await expect(removeManyManufacturers(['id1', 'id2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
