const { includes } = require('lodash');
const winston = require('winston');
const slugify = require('slugify');

const { detectColors, detectMemories } = require('./helper/productHelper');
const { Cache } = require('../enums');
const { BadRequestException, ConflictException, GeneralException, NotFoundException } = require('../exceptions');
const { mapCampaignArticleViewToEntity } = require('../mapper/campaignArticleMapper');
const {
    countCampaignArticles,
    deleteManyCampaignArticles,
    findCampaignArticles,
    findCampaignArticleByTitle,
    findCampaignArticleBySlug,
    saveCampaignArticle,
    updateCampaignArticle,
} = require('../repository/campaignArticleRepository');
const { findProductOptionsBySlugs } = require('../repository/productOptionRepository');
const { findManyProductsByIds, findProductById } = require('../repository/productRepository');
const { flushCache, getFromCache, setInCache } = require('../utils/cacheUtils');

/**
 * Check if products exist.
 * @private
 * @param {Array<ObjectId>} products
 * @returns {Promise<Boolean>}
 */
const checkCampaignProducts = async products => {
    winston.debug('campaignArticleService.checkCampaignProducts -- start');
    if (!products || !products.length) return;

    const productIds = products.map(p => p.productId);

    const productEntities = await findManyProductsByIds(productIds);
    if (!productEntities || !productEntities.length) {
        winston.warn('campaignArticleService.checkCampaignProducts -- product not found');
        throw new NotFoundException();
    }
    winston.debug('campaignArticleService.checkCampaignProducts -- success');
};

/**
 * Check if campaign with given title already exists.
 * @private
 * @param {String} title
 * @returns {Promise}
 */
const checkTitleExists = async title => {
    winston.debug('campaignArticleService.checkTitleExists -- start');
    if (!title) {
        winston.warn('campaignArticleService.checkTitleExists -- title is null');
        throw new BadRequestException();
    }

    const campaign = await findCampaignArticleByTitle(title);
    if (campaign) {
        winston.warn('campaignArticleService.checkTitleExists -- title exists');
        throw new ConflictException();
    }
    winston.debug('campaignArticleService.checkTitleExists -- success');
};

/**
 * Assign product entities to campaign.
 * @private
 * @param {CampaignArticleEntity} campaign
 */
const fetchCampaignProducts = async campaign => {
    winston.debug('campaignArticleService.assignCampaignProducts -- start');
    if (!campaign || !campaign.products || !campaign.products.length) return [];
    const { products } = campaign;

    const productEntities = [];
    for (let i = 0; i < products.length; i++) {
        const { productId, optionSlugs } = products[i];

        const [product, options] = await Promise.all([
            findProductById(productId),
            findProductOptionsBySlugs(optionSlugs),
        ]);
        if (product && options && options.length) {
            const includedOptions = options.filter(o => includes(optionSlugs, o.slug));
            product.options = includedOptions;
            product.memoryOptions = detectMemories(product.options);
            product.availableColors = detectColors(product.options, product.memoryOptions);
        }

        productEntities.push(product);
    }
    winston.debug('campaignArticleService.assignCampaignProducts -- success');
    return productEntities;
};

/**
 * Add new campaign news.
 * @param {CampaignNewsEntity} campaignNews
 * @returns {Promise<CampaignArticleEntity>}
 */
const addCampaignArticle = async campaignArticle => {
    winston.debug('campaignArticleService.addCampaignArticle -- start');
    if (!campaignArticle) {
        winston.warn('campaignArticleService.addCampaignArticle -- null param');
        throw new GeneralException();
    }

    await Promise.all([checkCampaignProducts(campaignArticle.products), checkTitleExists(campaignArticle.title)]);

    const entity = mapCampaignArticleViewToEntity(campaignArticle);
    entity.slug = slugify(entity.title).toLowerCase();

    const savedEntity = await saveCampaignArticle(entity);
    if (!savedEntity) {
        winston.warn('campaignArticleService.addCampaignArticle -- could not save');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('campaignArticleService.addCampaignArticle -- success');
    return savedEntity;
};

/**
 * Get campaign articles with pagination.
 * @param {RequestQuery} query
 * @returns {Promise<Object>}
 */
const getCampaignArticles = async query => {
    winston.debug('campaignArticleService.getCampaignArticles -- start');
    if (!query) {
        winston.warn('campaignArticleService.getCampaignArticles -- null param');
        throw new GeneralException();
    }

    let result = getFromCache(`${Cache.CAMPAIGN_ARTICLES}-all`);
    if (result) {
        winston.debug('campaignArticleService.getCampaignArticles -- found in cache');
        return result;
    }

    const limit = query.limit && parseInt(query.limit, 10) <= 100 ? parseInt(query.limit, 10) : 10;
    const page = parseInt(query.page, 10) || 1;

    const [campaigns, total] = await Promise.all([findCampaignArticles({ limit, page }), countCampaignArticles()]);
    if (!campaigns || (total !== 0 && !total)) {
        winston.warn('campaignArticleService.getCampaignArticles -- could not get');
        throw new GeneralException();
    }

    result = { limit, campaigns, page, total };
    setInCache(`${Cache.CAMPAIGN_ARTICLES}-all`, result);
    winston.debug('campaignArticleService.getCampaignArticles -- success');
    return result;
};

/**
 * Get campaign article by slug.
 * @param {String} slug
 * @returns {Promise<CampaignArticleEntity}
 */
const getCampaignArticleBySlug = async slug => {
    winston.debug('campaignArticleService.getCampaignArticleBySlug -- start');
    if (!slug) {
        winston.warn('campaignArticleService.getCampaignArticleBySlug -- null param');
        throw new GeneralException();
    }

    let campaignEntity = getFromCache(`${Cache.CAMPAIGN_ARTICLES}-${slug}`);
    if (campaignEntity) {
        winston.debug('campaignArticleService.getCampaignArticleBySlug -- found in cache');
        return campaignEntity;
    }

    campaignEntity = await findCampaignArticleBySlug(slug);
    if (!campaignEntity) {
        winston.warn('campaignArticleService.getCampaignArticleBySlug -- not found');
        throw new NotFoundException();
    }

    const products = await fetchCampaignProducts(campaignEntity);

    setInCache(`${Cache.CAMPAIGN_ARTICLES}-${slug}`, campaignEntity);
    winston.debug('campaignArticleService.getCampaignArticleBySlug -- success');
    return { campaignEntity, products };
};

/**
 * Update campaign article.
 * @param {ObjectId} id
 * @param {CampaignArticleEntity} campaignArticle
 * @returns {Promise<CampaignArticleEntity>}
 */
const modifyCampaignArticle = async (id, campaignArticle) => {
    winston.debug('campaignArticleService.modifyCampaignArticle -- start');
    if (!campaignArticle) {
        winston.warn('campaignArticleService.modifyCampaignArticle -- null param');
        throw new GeneralException();
    }

    await checkCampaignProducts(campaignArticle.products);

    const entity = mapCampaignArticleViewToEntity(campaignArticle);
    entity.slug = slugify(entity.title).toLowerCase();

    const savedEntity = await updateCampaignArticle(id, entity);
    if (!savedEntity) {
        winston.warn('campaignArticle.modifyCampaignArticle -- could not save');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('campaignArticle.modifyCampaignArticle -- success');
    return savedEntity;
};

/**
 * Delete many campaign articles by ids.
 * @param {Array<String>} ids
 */
const removeManyCampaignArticles = async ids => {
    winston.debug('campaignArticleService.removeManyCampaignArticles -- start');
    if (!ids || !ids.length) {
        winston.error(`campaignArticleService.removeManyCampaignArticles -- unexpected param: ${ids}`);
        throw new GeneralException();
    }

    const branchesDeleted = await deleteManyCampaignArticles(ids);
    if (!branchesDeleted) {
        winston.warn('campaignArticleService.removeManyCampaignArticles -- could not remove branches');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('campaignArticleService.removeManyCampaignArticles -- success');
};

module.exports = {
    addCampaignArticle,
    getCampaignArticles,
    getCampaignArticleBySlug,
    modifyCampaignArticle,
    removeManyCampaignArticles,
};
