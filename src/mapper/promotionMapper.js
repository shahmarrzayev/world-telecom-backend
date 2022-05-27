const { pick } = require('lodash');

const mapPromotionEntityToPromotionView = entity => {
    return entity ? pick(entity, ['_id', 'active', 'image', 'productId', 'createdAt']) : null;
};

const mapPromotionViewToPromotionEntity = view => {
    return view ? pick(view, ['active', 'image', 'productId']) : null;
};

module.exports = {
    mapPromotionEntityToPromotionView,
    mapPromotionViewToPromotionEntity,
};
