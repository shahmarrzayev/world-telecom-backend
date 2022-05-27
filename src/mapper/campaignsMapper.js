const { pick } = require('lodash');

const mapCampaignEntityToCampaignView = entity => {
    return entity ? pick(entity, ['_id', 'image', 'name', 'pricing', 'color']) : null;
};

const mapCampaignEntityToCampaignViewAdmin = entity => {
    return entity
        ? pick(entity, ['_id', 'active', 'image', 'name', 'pricing', 'color', 'createdBy', 'createdAt'])
        : null;
};

const mapCampaignViewToCampaignEntity = view => {
    return view ? pick(view, ['active', 'image', 'name', 'pricing', 'color']) : null;
};

module.exports = {
    mapCampaignEntityToCampaignView,
    mapCampaignEntityToCampaignViewAdmin,
    mapCampaignViewToCampaignEntity,
};
