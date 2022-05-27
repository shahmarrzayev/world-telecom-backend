const { pick } = require('lodash');

const mapLoanRequestEntityToLoanRequestView = entity => {
    if (!entity) return null;
    return pick(entity, [
        '_id',
        'fullName',
        'fin',
        'mobilePhone',
        'address',
        'param',
        'orderId',
        'orderedProductOption',
        'orderedNumber',
        'status',
        'wtStatus',
        'totalPrice',
        'createdAt',
    ]);
};

const mapLoanRequestViewToLoanRequestEntity = view => {
    return view
        ? pick(view, ['fullName', 'fin', 'mobilePhone', 'address', 'orderedProductOption', 'orderedNumber'])
        : null;
};

const mapNumberEntityToOrderedNumber = numberEntity => {
    return numberEntity ? pick(numberEntity, ['_id', 'operator', 'number', 'price', 'loanPrice']) : null;
};

const mapProductOptionEntityToOrderedProductOption = productOptionEntity => {
    if (!productOptionEntity) return null;
    return {
        _id: productOptionEntity._id,
        manufacturer: productOptionEntity.product.manufacturer,
        model: productOptionEntity.product.model,
        identificator: productOptionEntity.identificator,
        price: productOptionEntity.price,
    };
};

module.exports = {
    mapLoanRequestEntityToLoanRequestView,
    mapLoanRequestViewToLoanRequestEntity,
    mapNumberEntityToOrderedNumber,
    mapProductOptionEntityToOrderedProductOption,
};
