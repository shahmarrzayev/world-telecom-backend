const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const Campaign = require('./models/campaignModel');

const deleteManyCampaigns = async (ids, transaction) => {
    winston.debug('campaignRepository.deleteManyCampaigns -- start');
    if (!ids || !ids.length) {
        winston.warn('campaignRepository.deleteManyCampaigns -- null param');
        return null;
    }
    const queryResult = await runQuery(() => Campaign.deleteMany({ _id: { $in: ids } }, { session: transaction }));
    winston.debug('campaignRepository.deleteManyCampaigns -- success');
    return queryResult;
};

const findCampaignByName = async (name, transaction) => {
    winston.debug('campaignRepository.findCampaignByName -- start');
    if (!name) {
        winston.warn('campaignRepository.findCampaignByName -- null param');
        return null;
    }
    const campaignEntity = await runQuery(() => Campaign.findOne({ name }).session(transaction));
    winston.debug('campaignRepository.findCampaignByName -- success');
    return campaignEntity;
};

const findCampaignsInIds = async (ids, transaction) => {
    winston.debug('campaignRepository.findCampaignsInIds -- start');
    if (!ids || !ids.length) {
        winston.warn('campaignRepository.findCampaignsInIds -- null param');
        return null;
    }
    const campaignEntities = await runQuery(() => Campaign.find({ _id: { $in: ids } }).session(transaction));
    winston.debug('campaignRepository.findCampaignsInIds -- success');
    return campaignEntities;
};

const findAllCampaigns = async transaction => {
    winston.debug('campaignRepository.findAllCampaigns -- start');
    const campaignEntities = await runQuery(() => Campaign.find({}).session(transaction));
    winston.debug('campaignRepository.findAllCampaigns -- success');
    return campaignEntities;
};

const saveCampaign = async (campaign, transaction) => {
    winston.debug('campaignRepository.saveCampaign -- start');
    if (!campaign) {
        winston.warn('campaignRepository.saveCampaign -- null param');
        return null;
    }
    const dbCampaign = new Campaign(campaign);
    const campaignEntity = await runQuery(() => dbCampaign.save({ session: transaction }));
    winston.debug('campaignRepository.saveCampaign -- success');
    return campaignEntity;
};

const updateCampaign = async (id, campaign, transaction) => {
    winston.debug('campaignRepository.updateCampaign -- start');
    if (!id || !campaign) {
        winston.warn(`campaignRepository.updateCampaign -- null param: ${id}, ${campaign}`);
        return null;
    }
    const campaignEntity = await runQuery(() =>
        Campaign.findOneAndUpdate({ _id: id }, campaign, {
            session: transaction,
            useFindAndModify: false
        })
    );
    winston.debug('campaignRepository.updateCampaign -- success');
    return campaignEntity;
};

module.exports = {
    deleteManyCampaigns,
    findCampaignByName,
    findCampaignsInIds,
    findAllCampaigns,
    saveCampaign,
    updateCampaign,
};
