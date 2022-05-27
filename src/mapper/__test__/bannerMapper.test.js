const {
    mapBannerEntityToBannerView,
    mapBannerEntityToBannerViewAdmin,
    mapBannerViewToBannerEntity,
} = require('../bannerMapper');

const banner = {
    _id: '_id',
    image: 'image',
    linkUri: 'linkUri',
    order: 'order',
    unknownParam: 'unknownParam',
};

describe('bannerMapper', () => {
    describe('mapBannerEntityToBannerView', () => {
        test('success', () => {
            const bannerView = mapBannerEntityToBannerView(banner);

            expect(bannerView._id).toBe(banner._id);
            expect(bannerView.image).toBe(banner.image);
            expect(bannerView.linkUri).toBe(banner.linkUri);
            expect(bannerView.order).not.toBeDefined();
            expect(bannerView.unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is not defined', () => {
            const bannerView = mapBannerEntityToBannerView();

            expect(bannerView).toBeNull();
        });
    });

    describe('mapBannerEntityToBannerViewAdmin', () => {
        test('success', () => {
            const bannerView = mapBannerEntityToBannerViewAdmin(banner);

            expect(bannerView._id).toBe(banner._id);
            expect(bannerView.image).toBe(banner.image);
            expect(bannerView.linkUri).toBe(banner.linkUri);
            expect(bannerView.order).toBe(banner.order);
            expect(bannerView.unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is not defined', () => {
            const bannerView = mapBannerEntityToBannerView();

            expect(bannerView).toBeNull();
        });
    });

    describe('mapBannerViewToBannerEntity', () => {
        test('success', () => {
            const bannerEntity = mapBannerViewToBannerEntity(banner);

            expect(bannerEntity.image).toBe(banner.image);
            expect(bannerEntity.linkUri).toBe(banner.linkUri);
            expect(bannerEntity.order).toBe(banner.order);
            expect(bannerEntity._id).not.toBeDefined();
            expect(bannerEntity.unknownParam).not.toBeDefined();
        });

        test('returns null when view param is not defined', () => {
            const bannerEntity = mapBannerEntityToBannerView();

            expect(bannerEntity).toBeNull();
        });
    });
});
