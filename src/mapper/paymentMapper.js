const { pick } = require('lodash');

const mapPaymentEntityToPaymentView = entity => {
    if (!entity) return null;
    return pick(entity, [
        'reference',
        'client',
        'amount',
        'currency',
        'status',
        'responseCode',
        'responseMessage',
        'url',
        'installmentPeriod',
        'customerIp',
    ]);
};

const mapPaymentStatusClientViewToPaymentStatusView = clientView => {
    if (!clientView) return null;
    return pick(clientView, [
        'reference',
        'datetime',
        'pan',
        'amount',
        'system',
        'issuer',
        'rrn',
        'status',
        'approval',
        'message',
    ]);
};

module.exports = {
    mapPaymentEntityToPaymentView,
    mapPaymentStatusClientViewToPaymentStatusView,
};
