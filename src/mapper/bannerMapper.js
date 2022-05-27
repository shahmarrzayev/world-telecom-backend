const { pick } = require('lodash');

const mapBannerEntityToBannerView = entity => {
    return entity ? pick(entity, ['_id', 'image', 'linkUri']) : null;
};

const mapBannerEntityToBannerViewAdmin = entity => {
    return entity ? pick(entity, ['_id', 'image', 'order', 'linkUri']) : null;
};

const mapBannerViewToBannerEntity = view => {
    return view ? pick(view, ['image', 'linkUri', 'order']) : null;
};

module.exports = {
    mapBannerEntityToBannerView,
    mapBannerEntityToBannerViewAdmin,
    mapBannerViewToBannerEntity,
};
