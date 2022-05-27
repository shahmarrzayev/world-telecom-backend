const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const Banner = require('./models/bannerModel');

const deleteBannerById = async (id, transaction) => {
    winston.debug('bannerRepository.deleteBannerById -- start');
    if (!id) {
        winston.warn('bannerRepository.deleteBannerById -- id is null');
        return null;
    }
    const queryResult = await runQuery(() => Banner.deleteOne({ _id: id }, { session: transaction }));
    winston.debug('bannerRepository.deleteBannerById -- success');
    return queryResult;
};

const findAllBanners = async transaction => {
    winston.debug('bannerRepository.findAllBanners -- start');
    const banners = await runQuery(() =>
        Banner.find({})
            .sort('order')
            .session(transaction)
    );
    winston.debug('bannerRepository.findAllBanners -- success');
    return banners;
};

const saveBanner = async (banner, transaction) => {
    winston.debug('bannerRepository.saveBanner -- start');
    if (!banner) {
        winston.warn('bannerRepository.saveBanner -- null param');
        return null;
    }
    const dbBanner = new Banner(banner);
    const bannerEntity = await runQuery(() => dbBanner.save({ session: transaction }));
    winston.debug('bannerRepository.saveBanner -- success');
    return bannerEntity;
};

const updateBanner = async (id, banner, transaction) => {
    winston.debug('bannerRepository.updateBanner -- start');
    if (!id || !banner) {
        winston.warn(`bannerRepository.updateBanner -- null param: ${id}, ${banner}`);
        return null;
    }
    const bannerEntity = await runQuery(() =>
        Banner.findByIdAndUpdate(id, banner, {
            new: true,
            session: transaction,
            useFindAndModify: false,
        })
    );
    winston.debug('bannerRepository.updateBanner -- success');
    return bannerEntity;
};

module.exports = {
    deleteBannerById,
    findAllBanners,
    saveBanner,
    updateBanner,
};
