const winston = require('winston');

const { Cache } = require('../enums');
const { ConflictException, GeneralException, NotFoundException } = require('../exceptions');
const { mapBannerViewToBannerEntity } = require('../mapper/bannerMapper');
const { deleteBannerById, findAllBanners, saveBanner, updateBanner } = require('../repository/bannerRepository');
const { getFromCache, flushCache, setInCache } = require('../utils/cacheUtils');

/**
 * Add new banner.
 * @param {BannerView} bannerView
 * @returns {Promise<BannerEntity>}
 */
const addNewBanner = async bannerView => {
    winston.debug('bannerService.addNewBanner -- start');
    if (!bannerView) {
        winston.warn('bannerService.addNewBanner -- null param');
        throw new GeneralException();
    }

    const allBanners = await findAllBanners();
    if (!allBanners) {
        winston.warn('bannerService.addNewBanner -- could not get banners');
        throw new GeneralException();
    }
    if (allBanners.length && allBanners.length >= 10) {
        winston.warn('bannerService.addNewBanner -- at most 10 banners are allowed');
        throw new ConflictException('Ən çox 10 banner ola bilər');
    }

    let bannerEntity = mapBannerViewToBannerEntity(bannerView);
    bannerEntity = await saveBanner(bannerEntity);
    if (!bannerEntity) {
        winston.warn('bannerService.addNewBanner -- could not save banner');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('bannerService.addNewBanner -- success');
    return bannerEntity;
};

/**
 * Get all banners.
 * @returns {Promise<Array<BannerEntity>>}
 */
const getAllBanners = async () => {
    winston.debug('bannerService.getAllBanners -- start');
    let banners = getFromCache(Cache.BANNERS);
    if (banners) return banners;

    banners = await findAllBanners();
    if (!banners) {
        winston.warn('bannerService.getAllBanners -- could not get all banners');
        throw new GeneralException();
    }

    setInCache(Cache.BANNERS, banners);
    winston.debug('bannerService.getAllBanners -- success');
    return banners;
};

/**
 * Update banner.
 * @param {String} id
 * @param {BannerView} bannerView
 * @returns {Promise<BannerEntity>}
 */
const modifyBanner = async (id, bannerView) => {
    winston.debug('bannerService.modifyBanner -- success');
    if (!id || !bannerView) {
        winston.warn(`bannerService.modifyBanner -- null param: ${id}, ${bannerView}`);
        throw new GeneralException();
    }

    let bannerEntity = mapBannerViewToBannerEntity(bannerView);
    bannerEntity = await updateBanner(id, bannerEntity);
    if (!bannerEntity) {
        winston.warn('bannerService.modifyBanner -- banner not found');
        throw new NotFoundException('Banner tapılmadı');
    }
    flushCache();
    winston.debug('bannerService.modifyBanner -- success');
    return bannerEntity;
};

/**
 * Remove banner by id.
 * @param {String} id
 */
const removeBannerById = async id => {
    winston.debug('bannerService.removeBannerById -- start');
    if (!id) {
        winston.warn('bannerService.removeBannerById -- null param');
        throw new GeneralException();
    }

    const bannerDeleted = await deleteBannerById(id);
    if (!bannerDeleted) {
        winston.warn('bannerService.removeBannerById -- could not remove banner');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('bannerService.removeBannerById -- success');
};

module.exports = {
    addNewBanner,
    getAllBanners,
    modifyBanner,
    removeBannerById,
};
