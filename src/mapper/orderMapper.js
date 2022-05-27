const { pick } = require('lodash');

const { OrderStatus, PaymentType } = require('../enums');

const mapNumberEntitiesToOrderedNumbers = (numberEntities, orderedNumbers) => {
    if (!numberEntities || !numberEntities.length || !orderedNumbers || !orderedNumbers.length) {
        return [];
    }
    const orderedNumberEntities = [];
    numberEntities.forEach(entity => {
        const ordered = orderedNumbers.find(n => entity._id.equals(n._id));
        orderedNumberEntities.push({
            _id: entity._id,
            operator: entity.operator,
            number: entity.number,
            price: entity.price,
            selectedCampaigns: ordered.selectedCampaigns,
        });
    });
    return orderedNumberEntities;
};

const mapOrderEntityToOrderView = entity => {
    if (!entity) return null;
    const view = pick(entity, [
        '_id',
        'name',
        'lastName',
        'email',
        'mobilePhone',
        'paymentType',
        'orderedProductOptions',
        'orderedNumbers',
        'createdAt',
        'totalPrice',
        'orderStatus',
    ]);
    return view;
};

const mapOrderViewToOrderEntity = view => {
    if (!view) return null;
    const entity = pick(view, [
        'customerId',
        'name',
        'lastName',
        'email',
        'mobilePhone',
        'paymentType',
        'orderedProductOptions',
        'orderedNumbers',
    ]);
    entity.orderStatus =
        view.paymentType === PaymentType.CASH ? OrderStatus.PENDING_PROCESSING : OrderStatus.PENDING_PAYMENT;
    return entity;
};

const mapProductOptionEntitiesToOrderedProductOptions = (entities, orderedOptions) => {
    if (!entities || !entities.length || !orderedOptions || !orderedOptions.length) {
        return [];
    }
    const orderedProductOptions = [];
    entities.forEach(entity => {
        const ordered = orderedOptions.find(o => entity._id.equals(o._id));
        orderedProductOptions.push({
            _id: entity._id,
            count: ordered.count,
            identificator: entity.identificator,
            manufacturer: entity.product.manufacturer,
            model: entity.product.model,
            price: entity.price,
            product: entity.product,
            discount: entity.discount,
            selectedCampaigns: ordered.selectedCampaigns,
            selectedLoan: ordered.selectedLoan,
        });
    });
    return orderedProductOptions;
};

module.exports = {
    mapNumberEntitiesToOrderedNumbers,
    mapOrderEntityToOrderView,
    mapOrderViewToOrderEntity,
    mapProductOptionEntitiesToOrderedProductOptions,
};
