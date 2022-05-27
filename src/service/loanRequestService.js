const { isEmpty } = require('lodash');
const winston = require('winston');

const { LoanRequestStatus, LoanRequestWtStatus } = require('../enums');
const { GeneralException, NotFoundException } = require('../exceptions');
const {
    createLoanRequestForNumbers,
    createLoanRequestForProducts,
    getFilterParamsFromRequestQuery,
} = require('./helper/loanRequestHelper');
const {
    countLoanRequests,
    findLoanRequestById,
    findManyLoanRequests,
    saveLoanRequest,
    updateLoanRequest,
} = require('../repository/loanRequestRepository');

/**
 * Add new loan request.
 * @param {LoanRequestView} loanRequest
 * @param {Transaction} transaction
 * @returns {Promise<LoanRequestEntity>}
 */
const addNewLoanRequest = async (loanRequest, transaction) => {
    winston.debug('loanRequestService.addNewLoanRequest -- start');
    if (!loanRequest) {
        winston.warn('loanRequestService.addNewLoanRequest -- null param');
        throw new GeneralException();
    }

    let loanRequestEntity = null;
    if (!isEmpty(loanRequest.orderedProductOption) && !loanRequest.orderedNumber) {
        loanRequestEntity = await createLoanRequestForProducts(loanRequest, transaction);
    } else if (loanRequest.orderedNumber && isEmpty(loanRequest.orderedProductOption)) {
        loanRequestEntity = await createLoanRequestForNumbers(loanRequest, transaction);
    } else {
        winston.warn(`loanRequestService.addNewLoanRequest -- unknown case: ${JSON.stringify(loanRequest)}`);
        throw new GeneralException();
    }

    loanRequestEntity.actualAddress = loanRequestEntity.actualAddress || loanRequestEntity.registeredAddress;
    loanRequestEntity = await saveLoanRequest(loanRequestEntity, transaction);
    if (!loanRequestEntity) {
        winston.warn('loanRequestService.addNewLoanRequest -- could not save loan request');
        throw new GeneralException();
    }
    winston.debug('loanRequestService.addNewLoanRequest -- success');
    return loanRequestEntity;
};

/**
 * Approve loan request and register order.
 * @param {String} id
 */
const approveLoanRequest = async id => {
    winston.debug('loanRequestService.approveLoanRequest -- start');
    if (!id) {
        winston.warn('loanRequestService.approveLoanRequest -- null param: id is not defined');
        throw new GeneralException();
    }

    const loanRequestEntity = await findLoanRequestById(id);
    if (!loanRequestEntity) {
        winston.warn('loanRequestService.approveLoanRequest -- loan request not found');
        throw new NotFoundException('Kredit ərizəsi tapılmadı');
    }

    if (loanRequestEntity.status === LoanRequestStatus.APPROVED) {
        winston.warn('loanRequestService.approveLoanRequest -- already approved');
        return;
    }
    const updatedLoanRequestEntity = await updateLoanRequest(id, { status: LoanRequestStatus.APPROVED });
    if (!updatedLoanRequestEntity) {
        winston.warn('loanRequestService.approveLoanRequest -- could not update loan request');
        throw new GeneralException();
    }
    winston.debug('loanRequestService.approveLoanRequest -- success');
};

/**
 * Close loan request.
 * @param {String} id
 */
const closeLoanRequest = async id => {
    winston.debug('loanRequestService.closeLoanRequest -- start');
    if (!id) {
        winston.warn('loanRequestService.closeLoanRequest -- null param: id is not defined');
        throw new GeneralException();
    }
    const loanRequestEntity = await findLoanRequestById(id);
    if (!loanRequestEntity) {
        winston.warn('loanRequestService.closeLoanRequest -- loan request not found');
        throw new NotFoundException('Kredit ərizəsi tapılmadı');
    }

    const updatedLoanRequestEntity = await updateLoanRequest(id, { wtStatus: LoanRequestWtStatus.CLOSED });
    if (!updatedLoanRequestEntity) {
        winston.warn('loanRequestService.closeLoanRequest -- could not update loan request');
        throw new GeneralException();
    }
    winston.debug('loanRequestService.closeLoanRequest -- success');
};

/**
 * Get loan request by id.
 * @param {String} id
 * @returns {Promise<LoanRequestEntity>}
 */
const getLoanRequestById = async id => {
    winston.debug('loanRequestService.getLoanRequestById -- start');
    if (!id) {
        winston.warn('loanRequestService.getLoanRequestById -- null param: id is not defined');
        throw new GeneralException();
    }
    const loanRequestEntity = await findLoanRequestById(id);
    if (!loanRequestEntity) {
        winston.warn('loanRequestService.getLoanRequestById -- loan request not found');
        throw new NotFoundException('Kredit sorğusu tapılmadı');
    }
    winston.debug('loanRequestService.getLoanRequestById -- success');
    return loanRequestEntity;
};

/**
 * Find orders with filters.
 * @param {Request.query} requestQuery
 * @returns {Promise<Object>} result
 */
const getManyLoanRequests = async requestQuery => {
    winston.debug('loanRequestService.getManyLoanRequests -- start');
    if (!requestQuery) {
        winston.warn('loanRequestService.getManyLoanRequests -- null param: request query is null');
        throw new GeneralException();
    }

    const filterDetails = getFilterParamsFromRequestQuery(requestQuery);
    const { query, loanRequests } = await findManyLoanRequests(filterDetails);
    const total = await countLoanRequests(query);
    if (total !== 0 && !total) {
        winston.warn('loanRequestService.getManyLoanRequests -- could not count loan requests');
        throw new GeneralException();
    }
    winston.debug('loanRequestService.getManyLoanRequests -- success');
    return {
        limit: filterDetails.limit,
        loanRequests,
        page: filterDetails.page,
        total,
    };
};

module.exports = {
    addNewLoanRequest,
    closeLoanRequest,
    approveLoanRequest,
    getLoanRequestById,
    getManyLoanRequests,
};
