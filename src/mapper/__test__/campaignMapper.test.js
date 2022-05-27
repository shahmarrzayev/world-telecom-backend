const {
    mapCampaignEntityToCampaignView,
    mapCampaignEntityToCampaignViewAdmin,
    mapCampaignViewToCampaignEntity,
} = require('../campaignsMapper');

const campaign = {
    _id: '_id',
    active: 'active',
    image: 'image',
    name: 'name',
    pricing: 'pricing',
    color: 'color',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    unknownParam: 'unknownParam',
};

describe('campaignMapper', () => {
    describe('mapCampaignEntityToCampaignView', () => {
        test('success', () => {
            const view = mapCampaignEntityToCampaignView(campaign);

            expect(view._id).toBe(campaign._id);
            expect(view.image).toBe(campaign.image);
            expect(view.name).toBe(campaign.name);
            expect(view.pricing).toBe(campaign.pricing);
            expect(view.color).toBe(campaign.color);
            expect(view.active).not.toBeDefined();
            expect(view.createdAt).not.toBeDefined();
            expect(view.createdBy).not.toBeDefined();
            expect(view.unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is not defined', () => {
            const view = mapCampaignViewToCampaignEntity();

            expect(view).toBeNull();
        });
    });

    describe('mapCampaignEntityToCampaignViewAdmin', () => {
        test('success', () => {
            const view = mapCampaignEntityToCampaignViewAdmin(campaign);

            expect(view._id).toBe(campaign._id);
            expect(view.active).toBe(campaign.active);
            expect(view.image).toBe(campaign.image);
            expect(view.name).toBe(campaign.name);
            expect(view.pricing).toBe(campaign.pricing);
            expect(view.color).toBe(campaign.color);
            expect(view.createdAt).toBe(campaign.createdAt);
            expect(view.createdBy).toBe(campaign.createdBy);
            expect(view.unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is not defined', () => {
            const view = mapCampaignEntityToCampaignViewAdmin();

            expect(view).toBeNull();
        });
    });

    describe('mapCampaignViewToCampaignEntity', () => {
        test('success', () => {
            const entity = mapCampaignViewToCampaignEntity(campaign);

            expect(entity.active).toBe(campaign.active);
            expect(entity.image).toBe(campaign.image);
            expect(entity.name).toBe(campaign.name);
            expect(entity.pricing).toBe(campaign.pricing);
            expect(entity.color).toBe(campaign.color);
            expect(entity._id).not.toBeDefined();
            expect(entity.createdAt).not.toBeDefined();
            expect(entity.createdBy).not.toBeDefined();
            expect(entity.unknownParam).not.toBeDefined();
        });

        test('returns null when view param is not defined', () => {
            const entity = mapCampaignEntityToCampaignViewAdmin();

            expect(entity).toBeNull();
        });
    });
});
