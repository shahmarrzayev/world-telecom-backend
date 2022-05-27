const winston = require('winston');

const { Cache } = require('../enums');
const { ConflictException, GeneralException, NotFoundException } = require('../exceptions');
const { mapLoanViewToLoanEntity } = require('../mapper/loanMapper');
const {
    deleteManyLoans,
    findAllLoans,
    findLoanByTitle,
    findLoansInIds,
    saveLoan,
    updateLoan,
} = require('../repository/loanRepository');
const { deleteLoansFromProductOptions, updateLoanInProductOptions } = require('../repository/productOptionRepository');
const { flushCache, getFromCache, setInCache } = require('../utils/cacheUtils');

/**
 * Add new loan.
 * @param {LoanView} loanView
 * @param {String} userId
 * @param {Transaction} transaction
 * @returns {Promise<LoanEntity>}
 */
const addNewLoan = async (loanView, userId, transaction) => {
    winston.debug('loanService.addNewLoan -- start');
    if (!loanView || !userId) {
        winston.warn(`loanService.addNewLoan -- null param: ${loanView}, ${userId}`);
        throw new GeneralException();
    }

    const titleExists = await findLoanByTitle(loanView.title);
    if (titleExists) {
        winston.warn('loanService.addNewLoan -- loan with such title already exists');
        throw new ConflictException('loan with such title already exists');
    }

    let loanEntity = mapLoanViewToLoanEntity(loanView);
    loanEntity.createdBy = userId;
    loanEntity = await saveLoan(loanEntity, transaction);
    if (!loanEntity) {
        winston.warn('loanService.addNewLoan -- could not save loan');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('loanService.addNewLoan -- success');
    return loanEntity;
};

/**
 * Get all loans.
 * @returns {Promise<Array<LoanEntity>>}
 */
const getAllLoans = async () => {
    winston.debug('loanService.getAllLoans -- start');
    let loans = getFromCache(Cache.LOANS);
    if (loans) return loans;

    loans = await findAllLoans();
    if (!loans) {
        winston.warn('loanService.getAllLoans -- could not get loans');
        throw new GeneralException();
    }
    setInCache(Cache.LOANS, loans);
    winston.debug('loanService.getAllLoans -- success');
    return loans;
};

/**
 * Update loan.
 * @param {String} id
 * @param {LoanView} loanView
 * @param {String} userId
 * @param {Transaction} transaction
 * @returns {Promise<LoanEntity>}
 */
const modifyLoan = async (id, loanView, userId, transaction) => {
    winston.debug('loanService.modifyLoan -- start');
    if (!id || !loanView || !userId) {
        winston.warn(`loanService.modifyLoan -- null param: ${id}, ${loanView}, ${userId}`);
        throw new GeneralException();
    }

    if (loanView.title && loanView.title === 'Daxili kredit') {
        winston.warn('loanService.modifyLoan -- trying to modify that internal loan');
        throw new GeneralException(
            'Bu kreditin adının dəyişilməsi sistemdə xətalara səbəb ola bilər. Fuadla əlaqə saxlayın'
        );
    }

    let loanEntity = mapLoanViewToLoanEntity(loanView);
    loanEntity.updatedBy = userId;
    loanEntity = await updateLoan(id, loanEntity, transaction);
    if (!loanEntity) {
        winston.warn('loanService.modifyLoan -- could not update loan');
        throw new GeneralException();
    }
    const loanUpdatedInProductOptions = await updateLoanInProductOptions(loanEntity, transaction);
    if (!loanUpdatedInProductOptions) {
        winston.warn('loanService.modifyLoan -- could not update loan in product options');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('loanService.modifyLoan -- success');
    return loanEntity;
};

/**
 * Delete many loans by ids.
 * @param {Array<String>} ids
 * @param {Transaction} transaction
 */
const removeManyLoans = async (ids, transaction) => {
    winston.debug('loanService.removeManyLoans -- start');
    if (!ids || !ids.length) {
        winston.warn(`loanService.removeManyLoans -- null or empty param: ${ids}`);
        throw new GeneralException();
    }

    const loanEntities = await findLoansInIds(ids);
    if (!loanEntities || loanEntities.length !== ids.length) {
        winston.warn('loanService.removeManyLoans -- could not find loan');
        throw new NotFoundException('Loan not found');
    }

    const [loansDeleted, deletedFromProductOptions] = await Promise.all([
        deleteManyLoans(ids, transaction),
        deleteLoansFromProductOptions(ids, transaction),
    ]);

    if (!loansDeleted || !deletedFromProductOptions) {
        winston.warn('loanService.removeManyLoans -- could not remove loans');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('loanService.removeManyLoans -- success');
};

module.exports = {
    addNewLoan,
    getAllLoans,
    modifyLoan,
    removeManyLoans,
};
