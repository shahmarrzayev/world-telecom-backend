const { pick } = require('lodash');

const mapLoanEntityToLoanView = entity => {
    if (!entity) return null;
    return pick(entity, [
        '_id',
        'active',
        'color',
        'description',
        'firstPayment',
        'image',
        'isMain',
        'loanOptionId',
        'period',
        'price',
        'title',
    ]);
};

const mapLoanEntityToLoanViewAdmin = entity => {
    if (!entity) return null;
    return pick(entity, [
        '_id',
        'active',
        'color',
        'description',
        'firstPayment',
        'image',
        'isMain',
        'loanOptionId',
        'period',
        'price',
        'title',
        'createdBy',
        'createdAt',
    ]);
};

const mapLoanViewToLoanEntity = view => {
    return view ? pick(view, ['active', 'title', 'image', 'color', 'loanOptionId']) : null;
};

module.exports = {
    mapLoanEntityToLoanView,
    mapLoanEntityToLoanViewAdmin,
    mapLoanViewToLoanEntity,
};
