const winston = require('winston');
const { PaymentType } = require('../../enums');

const generateQueryForOrders = ({
    name,
    lastName,
    email,
    mobile,
    paymentType,
    productOptionId,
    orderStatus,
    minPrice,
    maxPrice,
    onlyNumbers,
    operator,
    number,
} = {}) => {
    winston.debug('orderRepositoryHelper.generateFilterAndQueryOrders -- start');
    const query = {};
    if (name) query.name = name;
    if (lastName) query.lastName = lastName;
    if (email) query.email = email;
    if (mobile) query.mobilePhone = mobile;
    if (paymentType && paymentType === 'CASH') {
        query.paymentType = paymentType;
    } else if (paymentType) {
        query.paymentType = [
            PaymentType.ONLINE,
            PaymentType.ONLINE_AZERICARD,
            PaymentType.ONLINE_PASHA_BANK,
            PaymentType.ONLINE_UNIBANK,
        ];
    }
    if (productOptionId) query.orderedProductOptions = productOptionId;
    if (orderStatus) query.orderStatus = orderStatus;
    if (minPrice) query.totalPrice = { $gt: minPrice };
    if (maxPrice) query.totalPrice = { ...query.totalPrice, $lt: maxPrice };
    if (onlyNumbers) {
        query.orderedNumbers = { $exists: true, $ne: [] };
    } else {
        query.orderedProductOptions = { $exists: true, $ne: [] };
    }
    if (operator) query.orderedNumbers.$elemMatch = { operator };
    if (number) query.orderedNumbers.$elemMatch = { ...query.orderedNumbers.$elemMatch, number };
    winston.debug('orderRepositoryHelper.generateFilterAndQueryOrders -- success');
    return query;
};

module.exports = {
    generateQueryForOrders,
};
