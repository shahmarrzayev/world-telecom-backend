const winston = require('winston');

const generateQueryForPayments = ({ intref, nonce, minAmount, maxAmount, rrn, status, orderId } = {}) => {
    winston.debug('paymentRepositoryHelper.generateQueryForPayments -- start');
    const query = {};
    if (intref) query.intref = intref;
    if (nonce) query.nonce = nonce;
    if (minAmount) query.totalPrice = { $gt: minAmount };
    if (maxAmount) query.totalPrice = { ...query.totalPrice, $lt: maxAmount };
    if (rrn) query.rrn = rrn;
    if (status) query.status = status;
    if (orderId) query.orderId = orderId;
    winston.debug('paymentRepositoryHelper.generateQueryForPayments -- success');
    return query;
};

module.exports = {
    generateQueryForPayments,
};
