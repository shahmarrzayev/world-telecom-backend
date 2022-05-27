const moment = require('moment');
const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const { generateQueryForLoanRequests } = require('./helper/loanRequestRepositoryHelper');
const { getPaginationDetails } = require('./helper/repositoryHelper');
const LoanRequest = require('./models/loanRequestModel');

const countLoanedAmount = async ({ id, manufacturer, model, identificator, from, to } = {}) => {
    winston.debug('loanRequestRepository.countLoanedAmount -- start');
    const match = {};
    if (id) match['orderedProductOption._id'] = id;
    if (manufacturer) match['orderedProductOption.manufacturer'] = manufacturer;
    if (model) match['orderedProductOption.model'] = model;
    if (identificator) match['orderedProductOption.identificator'] = identificator;
    if (from) match.createdAt = { $gte: moment.utc(from).toDate() };
    if (to) match.createdAt = { ...match.createdAt, $lte: moment.utc(to).toDate() };

    const result = await runQuery(() =>
        LoanRequest.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    sum: { $sum: '$orderedProductOption.selectedLoan.price' },
                    numberSum: { $sum: '$orderedNumber.loanPrice' },
                },
            },
        ])
    );
    winston.debug('loanRequestRepository.countLoanedAmount -- success');
    return result;
};

const countLoanedProducts = async () => {
    winston.debug('loanRequestRepository.countLoanedProducts -- start');
    const result = await runQuery(() =>
        LoanRequest.aggregate([
            {
                $group: {
                    _id: '$orderedProductOption._id',
                    manufacturer: { $first: '$orderedProductOption.manufacturer' },
                    model: { $first: '$orderedProductOption.model' },
                    identificator: { $first: '$orderedProductOption.identificator' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ])
    );
    winston.debug('loanRequestRepository.countLoanedProducts -- success');
    return result;
};

const countLoanedProductsBrands = async () => {
    winston.debug('loanRequestRepository.countLoanedProductsBrands -- start');
    const result = await runQuery(() =>
        LoanRequest.aggregate([
            {
                $group: {
                    _id: '$orderedProductOption.manufacturer',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ])
    );
    winston.debug('loanRequestRepository.countLoanedProductsBrands -- success');
    return result;
};

const countLoanRequests = async (query, transaction) => {
    winston.debug('loanRequestRepository.countLoanRequests -- start');
    if (!query) {
        winston.warn('loanRequestRepository.countLoanRequests -- null param');
        return null;
    }
    const count = await runQuery(() => LoanRequest.countDocuments(query).session(transaction));
    winston.debug('loanRequestRepository.countLoanRequests -- success');
    return count;
};

const countLoanRequestsMonthly = async (startDate, endDate, transaction) => {
    winston.debug('loanRequestRepository.countLoanRequestsMonthly -- start');
    const matchQuery = {};
    if (startDate) matchQuery.$gte = moment(startDate).toDate();
    if (endDate) matchQuery.$lte = moment(endDate).toDate();
    const result = await runQuery(() =>
        LoanRequest.aggregate([
            {
                $match: { createdAt: matchQuery },
            },
            {
                $group: {
                    _id: { $substr: ['$createdAt', 0, 7] },
                    total: { $sum: 1 },
                },
            },
        ]).session(transaction)
    );
    winston.debug('loanRequestRepository.countLoanRequestsMonthly -- success');
    return result;
};

const countLoanRequestsWithFilters = async ({ id, manufacturer, model, identificator, from, to } = {}, transaction) => {
    winston.debug('loanRequestRepository.countLoanRequestsWithFilters -- start');
    const query = {};
    if (id) query['orderedProductOption._id'] = id;
    if (manufacturer) query['orderedProductOption.manufacturer'] = manufacturer;
    if (model) query['orderedProductOption.model'] = model;
    if (identificator) query['orderedProductOption.identificator'] = identificator;
    if (from) query.createdAt = { $gte: moment.utc(from).toDate() };
    if (to) query.createdAt = { ...query.createdAt, $lte: moment.utc(to).toDate() };

    const count = await runQuery(() => LoanRequest.countDocuments(query).session(transaction));
    winston.debug('loanRequestRepository.countLoanRequestsWithFilters -- success');
    return count;
};

const findLoanRequestById = async (id, transaction) => {
    winston.debug('loanRequestRepository.findLoanRequestById -- start');
    if (!id) {
        winston.warn('loanRequestRepository.findLoanRequestById -- null param');
        return null;
    }
    const loanRequest = await runQuery(() => LoanRequest.findById(id).session(transaction));
    winston.debug('loanRequestRepository.findLoanRequestById -- success');
    return loanRequest;
};

const findManyLoanRequests = async (filterDetails, transaction) => {
    winston.debug('loanRequestRepository.findManyLoanRequests -- start');
    const query = generateQueryForLoanRequests(filterDetails);
    const { skip } = getPaginationDetails(filterDetails) || {};
    const loanRequests = await runQuery(() =>
        LoanRequest.find(query)
            .limit(filterDetails.limit)
            .skip(skip)
            .sort([['createdAt', -1]])
            .session(transaction)
    );
    winston.debug('loanRequestRepository.findManyLoanRequests -- success');
    return { query, loanRequests };
};

const saveLoanRequest = async (loanRequest, transaction) => {
    winston.debug('loanRequestRepository.saveLoanRequest -- start');
    if (!loanRequest) {
        winston.warn('loanRequestRepository.saveLoanRequest -- null param');
        return null;
    }
    const dbLoanRequest = new LoanRequest(loanRequest);
    const loanRequestEntity = await runQuery(() => dbLoanRequest.save({ session: transaction }));
    winston.debug('loanRequestRepository.saveLoanRequest -- success');
    return loanRequestEntity;
};

const updateLoanRequest = async (id, loanRequest, transaction) => {
    winston.debug('loanRequestRepository.updateLoanRequest -- start');
    if (!id || !loanRequest) {
        winston.warn(`loanRequestRepository.updateLoanRequest -- null param: ${id}, ${loanRequest}`);
        return null;
    }
    const loanRequestEntity = await runQuery(() =>
        LoanRequest.findByIdAndUpdate(id, loanRequest, {
            new: true,
            session: transaction,
            useFindAndModify: false,
        })
    );
    winston.debug('loanRequestRepository.updateLoanRequest -- success');
    return loanRequestEntity;
};

module.exports = {
    countLoanedAmount,
    countLoanedProducts,
    countLoanedProductsBrands,
    countLoanRequests,
    countLoanRequestsMonthly,
    countLoanRequestsWithFilters,
    findLoanRequestById,
    findManyLoanRequests,
    saveLoanRequest,
    updateLoanRequest,
};
