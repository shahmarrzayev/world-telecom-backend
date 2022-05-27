const winston = require('winston');

const { Cache } = require('../enums');
const { ConflictException, GeneralException, NotFoundException } = require('../exceptions');
const { mapCampaignViewToCampaignEntity } = require('../mapper/campaignsMapper');
const {
    deleteManyCampaigns,
    findCampaignByName,
    findCampaignsInIds,
    findAllCampaigns,
    saveCampaign,
    updateCampaign,
} = require('../repository/campaignRepository');
const { deleteCampaignsFromProductOptions } = require('../repository/productOptionRepository');
const { getFromCache, flushCache, setInCache } = require('../utils/cacheUtils');

/**
 * Add new campaign.
 * @param {CampaignView} campaignView
 * @param {String} userId
 * @param {Transaction} transaction
 * @returns {Promise<CampaignEntity>}
 */
const addNewCampaign = async (campaignView, userId, transaction) => {
    winston.debug('campaignService.addNewCampaign -- start');
    if (!campaignView || !userId) {
        winston.error(`campaignService.addNewCampaign -- null param: ${campaignView}, ${userId}`);
        throw new GeneralException();
    }

    const nameExists = await findCampaignByName(campaignView.name);
    if (nameExists) {
        winston.warn('campaignService.addNewCampaign -- campaign with such name exists');
        throw new ConflictException('Kampaniya artıq mövcuddur');
    }

    const campaignEntity = mapCampaignViewToCampaignEntity(campaignView);
    campaignEntity.createdBy = userId;
    const savedCampaignEntity = await saveCampaign(campaignEntity, transaction);
    if (!savedCampaignEntity) {
        winston.warn('campaignService.addNewCampaign -- could not save campaign');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('campaignService.addNewCampaign -- success');
    return savedCampaignEntity;
};

/**
 * Get all campaigns.
 * @returns {Promise<Array<CampaignEntity>>}
 */
const getAllCampaigns = async () => {
    winston.debug('campaignService.getCampaigns -- start');
    let campaigns = getFromCache(Cache.CAMPAIGNS);
    if (campaigns) return campaigns;

    campaigns = await findAllCampaigns();
    if (!campaigns) {
        winston.warn('campaignService.getCampaigns -- could not get campaigns');
        throw new GeneralException();
    }

    setInCache(Cache.CAMPAIGNS, campaigns);
    winston.debug('campaignService.getCampaigns -- success');
    return campaigns;
};

/**
 * Update campaign.
 * @param {String} campaignId
 * @param {CampaignView} campaignView
 * @param {Transaction} transaction
 * @returns {Promise<CampaignEntity>}
 */
const modifyCampaign = async (campaignId, campaignView, transaction) => {
    winston.debug('campaignService.modifyCampaign -- start');
    if (!campaignId || !campaignView) {
        winston.error(`campaignService.modifyCampaign -- null param: ${campaignId}, ${campaignView}`);
        throw new GeneralException();
    }

    let campaignEntity = mapCampaignViewToCampaignEntity(campaignView);
    campaignEntity = await updateCampaign(campaignId, campaignView, transaction);
    if (!campaignEntity) {
        winston.warn('campaignService.modifyCampaign -- campaign not found');
        throw new NotFoundException('Kampaniya tapılmadı');
    }

    flushCache();
    winston.debug('campaignService.modifyCampaign -- success');
    return campaignEntity;
};

/**
 * Delete category.
 * @param {Array<String>} campaignIds
 * @param {Transaction} transaction
 */
const removeManyCampaigns = async (campaignIds, transaction) => {
    winston.debug('campaignService.removeManyCampaigns -- start');
    if (!campaignIds || !campaignIds.length) {
        winston.error(`campaignService.removeManyCampaigns -- null or empty param: ${campaignIds}`);
        throw new GeneralException();
    }

    const campaignEntities = await findCampaignsInIds(campaignIds);
    if (campaignEntities.length !== campaignIds.length) {
        winston.warn('campaignService.removeManyCampaigns -- campaign not found');
        throw new NotFoundException('Kampaniya tapılmadı');
    }

    const [campaignsDeleted, deletedFromProducts] = await Promise.all([
        deleteManyCampaigns(campaignIds, transaction),
        deleteCampaignsFromProductOptions(campaignIds, transaction),
    ]);
    if (!campaignsDeleted || !deletedFromProducts) {
        winston.warn('campaignService.removeManyCampaigns -- could not remove campaigns');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('campaignService.removeManyCampaigns -- success');
};

module.exports = {
    addNewCampaign,
    getAllCampaigns,
    modifyCampaign,
    removeManyCampaigns,
};
