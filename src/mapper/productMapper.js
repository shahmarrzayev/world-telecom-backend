const { pick } = require('lodash');

const { mapCampaignEntityToCampaignView } = require('./campaignsMapper');
const { mapLoanEntityToLoanView } = require('./loanMapper');

const mapProductOptionEntityToView = (entity, excludeParams) => {
    if (!entity) return null;
    const fields = [
        '_id',
        'oneSId',
        'campaigns',
        'color',
        'identificator',
        'images',
        'isDefault',
        'loanOptions',
        'price',
        'discount',
        'product',
        'productId',
        'published',
        'memory',
        'slug',
    ];
    if (!excludeParams) fields.push('parameters');
    const view = pick(entity, fields);
    view.campaigns = view.campaigns && view.campaigns.length ? view.campaigns.map(mapCampaignEntityToCampaignView) : [];
    view.loanOptions = view.loanOptions && view.loanOptions.length ? view.loanOptions.map(mapLoanEntityToLoanView) : [];
    return view;
};

const mapProductEntityToView = (entity, excludeParams) => {
    if (!entity) return null;
    const view = pick(entity, [
        '_id',
        'availableColors',
        'availableMemories',
        'categories',
        'manufacturer',
        'memoryOptions',
        'model',
        'options',
        'relatedProducts',
        'onlinePaymentEnabled',
        'albaliKartPaymentEnabled',
        'birKartPaymentEnabled',
        'birKartMonths',
        'tamKartPaymentEnabled',
        'loanDescriptions',
        'tags'
    ]);
    view.options =
        entity.options && view.options.length
            ? view.options.map(o => mapProductOptionEntityToView(o, excludeParams))
            : [];

    return view;
};

const mapProductEntityToAdminView = entity => {
    if (!entity) return null;
    return pick(entity, [
        '_id',
        'oneSId',
        'availableColors',
        'availableMemories',
        'categories',
        'isPopular',
        'newProduct',
        'manufacturer',
        'memoryOptions',
        'model',
        'order',
        'options',
        'popularityOrder',
        'newProductOrder',
        'price',
        'published',
        'relatedProducts',
        'onlinePaymentEnabled',
        'albaliKartPaymentEnabled',
        'birKartPaymentEnabled',
        'birKartMonths',
        'tamKartPaymentEnabled',
        'loanDescriptions',
        'createdAt',
        'tags'
    ]);
};

const mapProductViewToProductAdmin = view => {
    if (!view) return null;
    return pick(view, [
        'oneSId',
        'categories',
        'isPopular',
        'newProduct',
        'manufacturer',
        'model',
        'options',
        'popularityOrder',
        'newProductOrder',
        'price',
        'published',
        'relatedProducts',
        'onlinePaymentEnabled',
        'albaliKartPaymentEnabled',
        'birKartPaymentEnabled',
        'birKartMonths',
        'tamKartPaymentEnabled',
        'loanDescriptions',
        'tags'
    ]);
};

module.exports = {
    mapProductEntityToView,
    mapProductEntityToAdminView,
    mapProductOptionEntityToView,
    mapProductViewToProductAdmin,
};
