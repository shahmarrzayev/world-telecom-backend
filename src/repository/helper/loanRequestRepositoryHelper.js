const winston = require('winston');
const moment = require('moment');

const generateQueryForLoanRequests = ({
    _id,
    fullName,
    mobilePhone,
    status,
    wtStatus,
    minPrice,
    maxPrice,
    productOptionId,
    createdAt,
} = {}) => {
    winston.debug('loanRequestRepositoryHelper.generateQueryForLoanRequests -- start');
    const query = {};
    if (_id) query._id = _id;
    if (fullName) query.fullName = fullName;
    if (mobilePhone) query.mobilePhone = mobilePhone;
    if (status) query.status = status;
    if (wtStatus) query.wtStatus = wtStatus;
    if (minPrice) query.totalPrice = { $gt: minPrice };
    if (maxPrice) query.totalPrice = { ...query.totalPrice, $lt: maxPrice };
    if (productOptionId) query.orderedProductOption._id = productOptionId;
    if (createdAt)
        query.createdAt = {
            $gt: moment(createdAt)
                .subtract(1, 'days')
                .toString(),
            $lt: moment(createdAt)
                .add(1, 'days')
                .toString(),
        };
    winston.debug('loanRequestRepositoryHelper.generateQueryForLoanRequests -- success');
    return query;
};

module.exports = {
    generateQueryForLoanRequests,
};
