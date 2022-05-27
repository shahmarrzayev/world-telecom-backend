const winston = require('winston');

const { validateCampaignArticle } = require('./validator/campaignArticleValidator');
const { Cache } = require('../enums');
const { BadRequestException } = require('../exceptions');
const {
    mapCampaignArticleEntityToView,
    mapCampaignArticleEntityToAdminView,
} = require('../mapper/campaignArticleMapper');
const { mapProductEntityToView } = require('../mapper/productMapper');
const {
    addCampaignArticle,
    getCampaignArticles,
    getCampaignArticleBySlug,
    modifyCampaignArticle,
    removeManyCampaignArticles,
} = require('../service/campaignArticleService');
const { getFromCache, setInCache } = require('../utils/cacheUtils');

/** Add new campaign article */
const addCampaignArticleController = async (req, res) => {
    winston.debug('campaignArticleController.addCampaignArticle -- start');
    const { body } = req;
    const error = validateCampaignArticle(body);
    if (error) {
        winston.warn(`branchValidator.addNewBranch -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const campaignArticle = await addCampaignArticle(req.body);
    winston.debug('campaignArticleController.addCampaignArticle -- success');
    return res.send(mapCampaignArticleEntityToView(campaignArticle));
};

/** Get campaign articles. */
const getCampaignArticlesController = async (req, res) => {
    winston.debug('campaignArticleController.getCampaignArticles -- start');
    const result = await getCampaignArticles(req.query);
    result.campaigns = req.user
        ? result.campaigns.map(mapCampaignArticleEntityToAdminView)
        : result.campaigns.map(mapCampaignArticleEntityToView);
    winston.debug('campaignArticleController.getCampaignArticles -- success');
    return res.send(result);
};

/** Get campaign article by slug. */
const getCampaignArticleBySlugController = async (req, res) => {
    winston.debug('campaignArticleController.getCampaignArticleBySlug -- start');
    const fromCache = getFromCache(`${Cache.CAMPAIGN_ARTICLES}-${req.params.slug}`);
    if (fromCache) return res.send(fromCache);

    const { campaignEntity, products } = await getCampaignArticleBySlug(req.params.slug);
    const campaign = req.user
        ? mapCampaignArticleEntityToAdminView(campaignEntity)
        : mapCampaignArticleEntityToView(campaignEntity);
    campaign.products = products;
    if (products && products.length) {
        campaign.products = campaign.products.map(mapProductEntityToView);
    }

    setInCache(`${Cache.CAMPAIGN_ARTICLES}-${req.params.slug}`, campaign);
    winston.debug('campaignArticleController.getCampaignArticleBySlug -- success');
    return res.send(campaign);
};

/** Modify campaign article. */
const modifyCampaignArticleController = async (req, res) => {
    winston.debug('campaignArticleController.modifyCampaignArticle -- start');
    const { body } = req;
    const error = validateCampaignArticle(body);
    if (error) {
        winston.warn(`branchValidator.modifyCampaignArticle -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }

    const campaignArticle = await modifyCampaignArticle(req.params.id, body);
    winston.debug('campaignArticleController.modifyCampaignArticle -- success');
    return res.send(campaignArticle);
};

/** Remove many campaign articles. */
const removeManyCampaignArticlesController = async (req, res) => {
    winston.debug('campaignArticleController.removeManyCampaignArticles -- start');
    await removeManyCampaignArticles(req.body.ids);
    winston.debug('campaignArticleController.removeManyCampaignArticles -- success');
    return res.send();
};

module.exports = {
    addCampaignArticleController,
    getCampaignArticlesController,
    getCampaignArticleBySlugController,
    modifyCampaignArticleController,
    removeManyCampaignArticlesController,
};
