jest.mock('winston');
jest.mock('../../mapper/bannerMapper');
jest.mock('../../repository/bannerRepository');
jest.mock('../../utils/cacheUtils');

const { addNewBanner, getAllBanners, modifyBanner, removeBannerById } = require('../bannerService');
const { ConflictException, GeneralException, NotFoundException } = require('../../exceptions');
const { mapBannerViewToBannerEntity } = require('../../mapper/bannerMapper');
const { deleteBannerById, findAllBanners, saveBanner, updateBanner } = require('../../repository/bannerRepository');
const { flushCache, getFromCache, setInCache } = require('../../utils/cacheUtils');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    deleteBannerById.mockReturnValue(Promise.resolve('deleted'));
    findAllBanners.mockReturnValue(Promise.resolve(['banner1', 'banner2']));
    flushCache.mockImplementation(() => {});
    getFromCache.mockReturnValue('fromCache');
    mapBannerViewToBannerEntity.mockReturnValue('bannerEntity');
    saveBanner.mockReturnValue(Promise.resolve('savedBannerEntity'));
    setInCache.mockImplementation(() => {});
    updateBanner.mockReturnValue(Promise.resolve('updatedBannerEntity'));
});

describe('bannerService', () => {
    describe('addNewBanner', () => {
        test('success', async () => {
            const result = await addNewBanner('bannerView');

            expect(result).toBe('savedBannerEntity');
            expect(findAllBanners).toHaveBeenCalledTimes(1);
            expect(mapBannerViewToBannerEntity).toHaveBeenCalledTimes(1);
            expect(saveBanner).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when bannerView param is null', async () => {
            await expect(addNewBanner(null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot get all banners', async () => {
            findAllBanners.mockReturnValue(Promise.resolve(null));

            await expect(addNewBanner('bannerView')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws conflict exception when there are already 10 banners', async () => {
            const allBanners = [];
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < 15; i++) {
                allBanners.push(`banner${i}`);
            }
            findAllBanners.mockReturnValue(Promise.resolve(allBanners));

            await expect(addNewBanner('bannerView')).rejects.toEqual(expect.any(ConflictException));
        });

        test('throws general exception when cannot save banner', async () => {
            saveBanner.mockReturnValue(Promise.resolve(null));

            await expect(addNewBanner('bannerView')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getAllBanners', () => {
        test('success - hits the cache', async () => {
            const result = await getAllBanners();

            expect(result).toBe('fromCache');
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findAllBanners).toHaveBeenCalledTimes(0);
        });

        test('success - gets from db', async () => {
            getFromCache.mockReturnValue(null);

            const result = await getAllBanners();

            expect(result.length).toBe(2);
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findAllBanners).toHaveBeenCalledTimes(1);
            expect(setInCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when cannot get banners', async () => {
            getFromCache.mockReturnValue(null);
            findAllBanners.mockReturnValue(Promise.resolve(null));

            await expect(getAllBanners()).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('modifyBanner', () => {
        test('success', async () => {
            const result = await modifyBanner('id', 'bannerView');

            expect(result).toBe('updatedBannerEntity');
            expect(mapBannerViewToBannerEntity).toHaveBeenCalledTimes(1);
            expect(updateBanner).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param is null', async () => {
            await expect(modifyBanner(null, 'bannerView')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when bannerView param is null', async () => {
            await expect(modifyBanner('id', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when updated banner is null', async () => {
            updateBanner.mockReturnValue(Promise.resolve(null));

            await expect(modifyBanner('id', 'bannerView')).rejects.toEqual(expect.any(NotFoundException));
        });
    });

    describe('removeBannerById', () => {
        test('success', async () => {
            await removeBannerById('id');

            expect(deleteBannerById).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param is null', async () => {
            await expect(removeBannerById(null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete banner', async () => {
            deleteBannerById.mockReturnValue(Promise.resolve(null));

            await expect(removeBannerById('id')).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
