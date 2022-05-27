const moment = require('moment');
const winston = require('winston');

const { calculateCampaignPriceForProduct } = require('./campaignHelper');
const { NumberStatus } = require('../../enums');
const { NotFoundException, GeneralException } = require('../../exceptions');
const { calculateTotalPrice } = require('./orderHelper');
const {
    mapLoanRequestViewToLoanRequestEntity,
    mapNumberEntityToOrderedNumber,
    mapProductOptionEntityToOrderedProductOption,
} = require('../../mapper/loanRequestMapper');
const { findAllCampaigns } = require('../../repository/campaignRepository');
const { findNumberById, updateNumber } = require('../../repository/numberRepository');
const { findProductOptionById } = require('../../repository/productOptionRepository');

/**
 * Returns selectedLoan object for LoanRequest.orderedProductOption entity.
 */
const findAndCreateLoan = (productOptionLoans, selectedLoanId) => {
    if (!productOptionLoans || !productOptionLoans.length) {
        return null;
    }
    const selectedLoan = productOptionLoans.find(l => l.loanOptionId === selectedLoanId);
    if (!selectedLoan) {
        return null;
    }
    return {
        _id: selectedLoan._id,
        firstPayment: selectedLoan.firstPayment,
        period: selectedLoan.period,
        price: selectedLoan.price,
    };
};

/**
 * Generates a loan request for number.
 */
const createLoanRequestForNumbers = async (loanRequest, transaction) => {
    winston.debug('loanRequestHelper.createLoanRequestForNumbers -- start');
    const loanRequestEntity = mapLoanRequestViewToLoanRequestEntity(loanRequest);

    const numberEntity = await findNumberById(loanRequestEntity.orderedNumber, transaction);
    if (!numberEntity) {
        winston.warn('loanRequestHelper.createLoanRequestForNumbers -- number not found');
        throw new NotFoundException('Nömrə tapılmadı');
    }
    if (!numberEntity.loanPrice) {
        winston.warn('loanRequestHelper.createLoanRequestForNumbers -- this loan has no price');
        throw new GeneralException();
    }

    numberEntity.status = NumberStatus.SOLD;
    await updateNumber(numberEntity._id, numberEntity, transaction);

    loanRequestEntity.orderedNumber = mapNumberEntityToOrderedNumber(numberEntity);
    loanRequestEntity.totalPrice = numberEntity.loanPrice;
    winston.debug('loanRequestHelper.createLoanRequestForNumbers -- success');
    return loanRequestEntity;
};

/**
 * Generates a loan request for product.
 */
const createLoanRequestForProducts = async (loanRequest, transaction) => {
    winston.debug('loanRequestHelper.createLoanRequestForProducts -- start');
    const loanRequestEntity = mapLoanRequestViewToLoanRequestEntity(loanRequest);

    const orderedProductOptionEntity = await findProductOptionById(
        loanRequestEntity.orderedProductOption._id,
        transaction
    );
    if (!orderedProductOptionEntity || !orderedProductOptionEntity.published || !orderedProductOptionEntity.price) {
        winston.warn('loanRequestService.addNewLoanRequest -- productOption not found');
        throw new NotFoundException('Məhsul tapılmadı');
    }
    loanRequestEntity.orderedProductOption = mapProductOptionEntityToOrderedProductOption(orderedProductOptionEntity);

    const loan = findAndCreateLoan(
        orderedProductOptionEntity.loanOptions,
        loanRequest.orderedProductOption.selectedLoan
    );
    if (!loan) {
        winston.warn('loanRequestService.addNewLoanRequest -- product option does not have this loan');
        throw new NotFoundException('Bu məhsul üçün seçilmiş kredit təklifi mövcüd deyil');
    }
    loanRequestEntity.orderedProductOption.selectedLoan = loan;

    const campaigns = await findAllCampaigns(transaction);
    loanRequestEntity.orderedProductOption.selectedCampaigns = loanRequest.orderedProductOption.selectedCampaigns.map(
        campaignId => {
            return {
                _id: campaignId,
                price: calculateCampaignPriceForProduct(campaigns, campaignId, orderedProductOptionEntity._id),
            };
        }
    );

    // TODO: Think of something that is not this ugly - maybe separate method for loan prices or change method itself.
    loanRequestEntity.totalPrice = calculateTotalPrice({
        orderedProductOptions: [loanRequestEntity.orderedProductOption],
    });
    winston.debug('loanRequestHelper.createLoanRequestForProducts -- success');
    return loanRequestEntity;
};

/**
 * Returns filter parameters for querying.
 */
const getFilterParamsFromRequestQuery = query => {
    return {
        _id: query.id,
        fullName: query.fullName,
        mobilePhone: query.mobilePhone,
        status: query.status,
        wtStatus: query.wtStatus,
        minPrice: parseFloat(query.minPrice),
        maxPrice: parseFloat(query.maxPrice),
        productOptionId: query.productOptionId,
        createdAt:
            query.createdAt && moment(query.createdAt).isValid() ? moment(query.createdAt).format('YYYY-MM-DD') : null,
        page: parseInt(query.page, 10) || 1,
        limit: parseInt(query.limit, 10) || 10,
    };
};

module.exports = {
    createLoanRequestForNumbers,
    createLoanRequestForProducts,
    getFilterParamsFromRequestQuery,
};
