const winston = require('winston');

const { getPaginationDetails, runQuery } = require('./helper/repositoryHelper');
const CampaignArticle = require('./models/campaignArticleModel');

/** Count campaign articles. */
const countCampaignArticles = async transaction => {
    winston.debug('campaignArticleRepository.countCampaignArticles -- start');
    const count = await runQuery(() => CampaignArticle.countDocuments().session(transaction));
    winston.debug('campaignArticlesRepository.countCampaignArticles -- success');
    return count;
};

/** Delete many campaign articles. */
const deleteManyCampaignArticles = async (ids, transaction) => {
    winston.debug('campaignArticleRepository.deleteManyCampaignArticles -- start');
    if (!ids || !ids.length) {
        winston.warn('campaignArticleRepository.deleteManyCampaignArticles -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() =>
        CampaignArticle.deleteMany({ _id: { $in: ids } }, { session: transaction })
    );
    winston.debug('campaignArticleRepository.deleteManyCampaignArticles -- success');
    return queryResult;
};

/** Find campaign articles. */
const findCampaignArticles = async ({ limit, page }, transaction) => {
    winston.debug('campaignArticleRepository.findCampaignArticles -- start');
    const { skip } = getPaginationDetails({ limit, page });
    const campaignNews = await runQuery(() =>
        CampaignArticle.find()
            .limit(limit)
            .skip(skip)
            .sort({ order: 1 })
            .session(transaction)
    );
    winston.debug('campaignArticleRepository.findCampaignArticles -- success');
    return campaignNews;
};

/** Find campaign article by title. */
const findCampaignArticleByTitle = async (title, transaction) => {
    winston.debug('campaignArticleRepository.findCampaignArticleByTitle -- start');
    if (!title) return null;
    const campaignArticle = await runQuery(() => CampaignArticle.findOne({ title }).session(transaction));
    winston.debug('campaignArticleRepository.findCampaignArticleByTitle -- success');
    return campaignArticle;
};

/** Find campaign article by slug. */
const findCampaignArticleBySlug = async (slug, transaction) => {
    winston.debug('campaignArticleRepository.findCampaignArticleBySlug -- start');
    if (!slug) return null;
    const campaignArticle = await runQuery(() => CampaignArticle.findOne({ slug }).session(transaction));
    winston.debug('campaignArticleRepository.findCampaignArticleBySlug -- success');
    return campaignArticle;
};

/** Save campaign article. */
const saveCampaignArticle = async (campaign, transaction) => {
    winston.debug('campaignArticleRepository.saveCampaignArticle -- start');
    if (!campaign) {
        winston.warn('campaignArticleRepository.saveCampaignArticle -- null param');
        return null;
    }
    const dbCampaign = new CampaignArticle(campaign);
    const campaignEntity = await runQuery(() => dbCampaign.save({ session: transaction }));
    winston.debug('campaignArticleRepository.saveCampaignArticle -- success');
    return campaignEntity;
};

/** Update campaign article. */
const updateCampaignArticle = async (id, campaign, transaction) => {
    winston.debug('campaignArticleRepository.updateCampaignArticle -- start');
    if (!id || !campaign) {
        winston.warn(`campaignArticleRepository.updateCampaignArticle -- null param: ${id}, ${campaign}`);
        return null;
    }
    const campaignEntity = await runQuery(() =>
        CampaignArticle.findOneAndUpdate({ _id: id }, campaign, {
            session: transaction,
        })
    );
    winston.debug('campaignArticleRepository.updateCampaignArticle -- success');
    return campaignEntity;
};

module.exports = {
    countCampaignArticles,
    deleteManyCampaignArticles,
    findCampaignArticles,
    findCampaignArticleByTitle,
    findCampaignArticleBySlug,
    saveCampaignArticle,
    updateCampaignArticle,
};
