const { pick } = require('lodash');

const mapCampaignArticleEntityToView = entity => {
    if (!entity) return null;
    return pick(entity, [
        '_id',
        'title',
        'subtitle',
        'description',
        'image',
        'thumbnail',
        'products',
        'order',
        'slug',
        'validFrom',
        'validTo',
    ]);
};

const mapCampaignArticleEntityToAdminView = entity => {
    if (!entity) return null;
    return pick(entity, [
        '_id',
        'title',
        'subtitle',
        'description',
        'image',
        'thumbnail',
        'products',
        'order',
        'slug',
        'validFrom',
        'validTo',
        'published',
        'createdAt',
        'updatedAt',
    ]);
};

const mapCampaignArticleViewToEntity = view => {
    if (!view) return null;
    return pick(view, [
        '_id',
        'title',
        'subtitle',
        'description',
        'image',
        'thumbnail',
        'products',
        'order',
        'published',
        'validFrom',
        'validTo',
    ]);
};

module.exports = {
    mapCampaignArticleEntityToView,
    mapCampaignArticleEntityToAdminView,
    mapCampaignArticleViewToEntity,
};
