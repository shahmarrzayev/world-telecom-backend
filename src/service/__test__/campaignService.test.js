jest.mock('winston');
jest.mock('../../mapper/campaignsMapper');
jest.mock('../../repository/campaignRepository');
jest.mock('../../repository/productOptionRepository');
jest.mock('../../utils/cacheUtils');

const { addNewCampaign, getAllCampaigns, modifyCampaign, removeManyCampaigns } = require('../campaignService');
const { ConflictException, GeneralException, NotFoundException } = require('../../exceptions');
const { mapCampaignViewToCampaignEntity } = require('../../mapper/campaignsMapper');
const {
    deleteManyCampaigns,
    findAllCampaigns,
    findCampaignByName,
    findCampaignsInIds,
    saveCampaign,
    updateCampaign,
} = require('../../repository/campaignRepository');
const { deleteCampaignsFromProductOptions } = require('../../repository/productOptionRepository');
const { getFromCache, flushCache, setInCache } = require('../../utils/cacheUtils');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    getFromCache.mockReturnValue('fromCache');
    deleteCampaignsFromProductOptions.mockImplementation(() => Promise.resolve('deleted'));
    deleteManyCampaigns.mockImplementation(() => Promise.resolve('deleted'));
    findAllCampaigns.mockReturnValue(Promise.all(['campaignEntity1', 'campaignEntity2']));
    findCampaignByName.mockReturnValue(Promise.resolve(null));
    findCampaignsInIds.mockReturnValue(Promise.resolve(['campaign1', 'campaign2']));
    flushCache.mockImplementation(() => {});
    mapCampaignViewToCampaignEntity.mockReturnValue('campaignEntity');
    saveCampaign.mockReturnValue(Promise.resolve('savedCampaignEntity'));
    setInCache.mockImplementation(() => {});
    updateCampaign.mockReturnValue(Promise.resolve('updatedCampaignEntity'));
});

describe('campaignService', () => {
    describe('addNewCampaign', () => {
        test('success', async () => {
            const result = await addNewCampaign('campaignView', 'userId');

            expect(result).toBeDefined();
            expect(result).toBe('savedCampaignEntity');
            expect(findCampaignByName).toHaveBeenCalledTimes(1);
            expect(mapCampaignViewToCampaignEntity).toHaveBeenCalledTimes(1);
            expect(saveCampaign).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when campaignView param is null', async () => {
            await expect(addNewCampaign(null, 'userId')).rejects.toEqual(expect.any(GeneralException));
            expect(flushCache).toHaveBeenCalledTimes(0);
        });

        test('throws general exception when userId param is null', async () => {
            await expect(addNewCampaign('campaignView', null)).rejects.toEqual(expect.any(GeneralException));
            expect(flushCache).toHaveBeenCalledTimes(0);
        });

        test('throws conflict exception when campaign with such a name already exists', async () => {
            findCampaignByName.mockReturnValue(Promise.resolve('campaignEntity'));

            await expect(addNewCampaign('campaignView', 'userId')).rejects.toEqual(expect.any(ConflictException));
            expect(flushCache).toHaveBeenCalledTimes(0);
        });

        test('throws general exception when cannot save campaign', async () => {
            saveCampaign.mockReturnValue(Promise.resolve(null));

            await expect(addNewCampaign('campaignView', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getAllCampaigns', () => {
        test('success - hits the cache', async () => {
            const result = await getAllCampaigns();

            expect(result).toBe('fromCache');
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findAllCampaigns).toHaveBeenCalledTimes(0);
            expect(setInCache).toHaveBeenCalledTimes(0);
        });

        test('success - gets from db', async () => {
            getFromCache.mockReturnValue(null);

            const result = await getAllCampaigns();

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findAllCampaigns).toHaveBeenCalledTimes(1);
            expect(setInCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when cannot get campaigns', async () => {
            getFromCache.mockReturnValue(null);
            findAllCampaigns.mockReturnValue(Promise.resolve(null));

            await expect(getAllCampaigns()).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('modifyCampaign', () => {
        test('success', async () => {
            const result = await modifyCampaign('campaignId', 'campaignView');

            expect(result).toBe('updatedCampaignEntity');
            expect(mapCampaignViewToCampaignEntity).toHaveBeenCalledTimes(1);
            expect(updateCampaign).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when campaignId param is null', async () => {
            await expect(modifyCampaign(null, 'campaignView')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when campaignView param is null', async () => {
            await expect(modifyCampaign('campaignId', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when updated campaign entity is null', async () => {
            updateCampaign.mockReturnValue(Promise.resolve(null));

            await expect(modifyCampaign('campaignId', 'campaignView')).rejects.toEqual(expect.any(NotFoundException));
        });
    });

    describe('removeManyCampaigns', () => {
        test('success', async () => {
            await removeManyCampaigns(['campaign1', 'campaign2']);

            expect(findCampaignsInIds).toHaveBeenCalledTimes(1);
            expect(deleteManyCampaigns).toHaveBeenCalledTimes(1);
            expect(deleteCampaignsFromProductOptions).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when campaignIds param is not defined', async () => {
            await expect(removeManyCampaigns(null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when campaignIds param is empty array', async () => {
            await expect(removeManyCampaigns([])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when one or more of ids not found', async () => {
            findCampaignsInIds.mockReturnValue(Promise.resolve(['campaign1']));

            await expect(removeManyCampaigns(['campaign1', 'campaign2'])).rejects.toEqual(
                expect.any(NotFoundException)
            );
        });

        test('throws general exception when cannot delete campaigns', async () => {
            deleteManyCampaigns.mockReturnValue(Promise.resolve(null));

            await expect(removeManyCampaigns(['campaign1', 'campaign2'])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete campaigns from product options', async () => {
            deleteCampaignsFromProductOptions.mockReturnValue(Promise.resolve(null));

            await expect(removeManyCampaigns(['campaign1', 'campaign2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
