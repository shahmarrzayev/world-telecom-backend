const winston = require('winston');

const { validateCampaign } = require('./validator/campaignValidator');
const { validateArrayOfObjectIds } = require('./validator/commonValidator');
const { WTUserActivity } = require('../enums');
const { BadRequestException } = require('../exceptions');
const { mapCampaignEntityToCampaignViewAdmin } = require('../mapper/campaignsMapper');
const { addNewCampaign, getAllCampaigns, modifyCampaign, removeManyCampaigns } = require('../service/campaignService');
const { recordUserActivity } = require('../service/userActivityService');

/**
 * Add new campaign.
 */
const addNewCampaignController = async (req, res) => {
    winston.debug('campaignController.addNewCampaign -- start');
    const { body, transaction, user } = req;
    const error = validateCampaign(body);
    if (error) {
        winston.warn(`campaignController.addNewCampaign -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const campaign = await addNewCampaign(body, user._id, transaction);
    await recordUserActivity(user, WTUserActivity.ADD_CAMPAIGN, transaction);
    winston.debug('campaignController.addNewCampaignAdmin -- success');
    return res.send(mapCampaignEntityToCampaignViewAdmin(campaign));
};

/**
 * Get all campaigns.
 */
const getCampaignsController = async (req, res) => {
    winston.debug('campaignController.getCampaigns -- start');
    const campaigns = await getAllCampaigns();
    winston.debug('campaignController.getCampaigns -- success');
    return res.send(campaigns.map(mapCampaignEntityToCampaignViewAdmin));
};

/**
 * Modify campaign.
 */
const modifyCampaignController = async (req, res) => {
    winston.debug('campaignController.modifyCampaign -- start');
    const { body, params, transaction } = req;
    const error = validateCampaign(body);
    if (error) {
        winston.warn(`campaignController.modifyCampaign -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const campaign = await modifyCampaign(params.id, body, transaction);
    await recordUserActivity(req.user, WTUserActivity.MODIFY_CAMPAIGN, transaction);
    winston.debug('campaignController.modifyCampaign -- success');
    return res.send(mapCampaignEntityToCampaignViewAdmin(campaign));
};

/**
 * Remove many campaigns.
 */
const removeManyCampaignsController = async (req, res) => {
    winston.debug('campaignController.removeManyCampaigns -- start');
    const { body, transaction } = req;
    const error = validateArrayOfObjectIds(body);
    if (error) {
        winston.warn(`campaignController.removeManyCampaigns -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    await removeManyCampaigns(body, transaction);
    await recordUserActivity(req.user, WTUserActivity.DELETE_CAMPAIGN, transaction);
    winston.debug('campaignController.removeManyCampaigns -- success');
    return res.send();
};

module.exports = {
    addNewCampaignController,
    getCampaignsController,
    modifyCampaignController,
    removeManyCampaignsController,
};
