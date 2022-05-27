const winston = require('winston');

const calculateCampaignPriceForProduct = (allCampaigns, campaignId, productPrice) => {
    winston.debug('campaignHelper.calculateCampaignPrice -- start');
    const campaign = allCampaigns.find(c => c._id.equals(campaignId));
    if (!campaign) {
        winston.debug('campaignHelper.calculateCampaignPrice -- campaign not found');
        return null;
    }
    const pricing = campaign.pricing
        ? campaign.pricing.find(p => p.from <= productPrice && p.to >= productPrice)
        : null;
    winston.debug('campaignHelper.calculateCampaignPrice -- success');
    return pricing ? pricing.price : 0;
};

module.exports = {
    calculateCampaignPriceForProduct,
};
