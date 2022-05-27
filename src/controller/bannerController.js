const winston = require('winston');

const { validateBanner } = require('./validator/bannerValidator');
const { WTUserActivity } = require('../enums');
const { BadRequestException } = require('../exceptions');
const { mapBannerEntityToBannerViewAdmin } = require('../mapper/bannerMapper');
const { addNewBanner, getAllBanners, modifyBanner, removeBannerById } = require('../service/bannerService');
const { recordUserActivity } = require('../service/userActivityService');

/**
 * Add new banner.
 */
const addNewBannerController = async (req, res) => {
    winston.debug('bannerController.addNewBanner -- start');
    const error = validateBanner(req.body);
    if (error) {
        winston.warn(`bannerController.addNewBanner -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const bannerEntity = await addNewBanner(req.body);
    await recordUserActivity(req.user, WTUserActivity.ADD_BANNER);
    winston.debug('bannerController.addNewBanner -- success');
    return res.send(mapBannerEntityToBannerViewAdmin(bannerEntity));
};

/**
 * Get all banners.
 */
const getAllBannersController = async (req, res) => {
    winston.debug('bannerController.getAllBanners -- start');
    const banners = await getAllBanners();
    winston.debug('bannerController.getAllBanners -- success');
    return res.send(banners.map(mapBannerEntityToBannerViewAdmin));
};

/**
 * Modify banner.
 */
const modifyBannerController = async (req, res) => {
    winston.debug('bannerController.modifyBanner -- start');
    const { body, params } = req;
    const error = validateBanner(body);
    if (error) {
        winston.warn(`bannerController.modifyBanner -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const bannerEntity = await modifyBanner(params.id, body);
    await recordUserActivity(req.user, WTUserActivity.MODIFY_BANNER);
    winston.debug('bannerController.modifyBanner -- success');
    return res.send(mapBannerEntityToBannerViewAdmin(bannerEntity));
};

/**
 * Remove banner by id.
 */
const removeBannerByIdController = async (req, res) => {
    winston.debug('bannerController.removeBannerByIdController -- start');
    await removeBannerById(req.params.id);
    await recordUserActivity(req.user, WTUserActivity.DELETE_BANNER);
    winston.debug('bannerController.removeBannerByIdController -- success');
    return res.send();
};

module.exports = {
    addNewBannerController,
    getAllBannersController,
    modifyBannerController,
    removeBannerByIdController,
};
