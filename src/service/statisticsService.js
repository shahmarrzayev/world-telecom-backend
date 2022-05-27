const winston = require('winston');

const { GeneralException } = require('../exceptions');
const { sortByMonthAndMapData } = require('./helper/statisticsHelper');
const {
    countLoanedAmount,
    countLoanedProducts,
    countLoanedProductsBrands,
    countLoanRequestsMonthly,
    countLoanRequestsWithFilters,
} = require('../repository/loanRequestRepository');
const { findProductOptionByFullName } = require('../repository/productOptionRepository');
const {
    countOrderedAmount,
    countOrderedProductsBrands,
    countOrderedProducts,
    countOrdersMonthly,
    countOrdersWithFilters,
} = require('../repository/orderRepository');

/**
 * Get counts of the loaned products.
 */
const countLoanedProductsById = async () => {
    winston.debug('statisticsService.countLoanedProductsById -- start');
    const result = await countLoanedProducts();
    if (!result) {
        winston.warn('statisticsService.countLoanedProductsById -- could not count loaned products');
        throw new GeneralException();
    }
    winston.debug('statisticsService.countLoanedProductsById -- success');
    return result;
};

/**
 * Get counts of loaned products by brand.
 */
const countLoanedProductsManufacturers = async () => {
    winston.debug('statisticsService.countLoanedProductsManufacturers -- start');
    const result = await countLoanedProductsBrands();
    if (!result) {
        winston.warn('statisticsService.countLoanedProductsManufacturers -- could not count loaned products');
        throw new GeneralException();
    }
    winston.debug('statisticsService.countLoanedProductsManufacturers -- start');
    return result;
};

/**
 * Get loan requests from start date to end date.
 */
const countLoanRequestsFromTo = async ({ startDate, endDate }) => {
    winston.debug('statisticsService.countLoanRequestsFromTo -- start');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const from = !startDate || startDate < sixMonthsAgo ? sixMonthsAgo : startDate;
    let result = await countLoanRequestsMonthly(from, endDate);
    if (!result) {
        winston.warn('statisticsService.countLoanRequestsFromTo -- could not count loan requests');
        throw new GeneralException();
    }
    result = sortByMonthAndMapData(result);
    winston.debug('statisticsService.countLoanRequestsFromTo -- success');
    return result || [];
};

/**
 * Get counts of the ordered products.
 */
const countOrderedProductsById = async filters => {
    winston.debug('statisticsService.countOrderedProductsById -- start');
    const result = await countOrderedProducts(filters);
    if (!result) {
        winston.warn('statisticsService.countOrderedProductsById -- could not count ordered products');
        throw new GeneralException();
    }
    winston.debug('statisticsService.countOrderedProductsById -- success');
    return result;
};

/**
 * Get counts of ordered products by brand.
 */
const countOrderedProductsByManufacturer = async () => {
    winston.debug('statisticsService.countOrderedProductsByManufacturer -- start');
    const result = await countOrderedProductsBrands();
    if (!result) {
        winston.warn('statisticsService.countOrderedProductsById -- could not count products by brand');
        throw new GeneralException();
    }
    winston.debug('statisticsService.countOrderedProductsByManufacturer -- success');
    return result;
};

/**
 * Get loan requests from start date to end date.
 */
const countOrdersFromTo = async ({ startDate, endDate } = {}) => {
    winston.debug('statisticsService.countOrdersFromTo -- start');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const from = !startDate || startDate < sixMonthsAgo ? sixMonthsAgo : startDate;

    const result = await countOrdersMonthly(from, endDate);
    if (!result) {
        winston.warn('statisticsService.countOrdersFromTo -- could not count orders');
        throw new GeneralException();
    }
    winston.debug('statisticsService.countOrdersFromTo -- success');
    return sortByMonthAndMapData(result) || [];
};

/**
 * Get total money earned from loaned products by new w-t.
 */
const countTotalLoanedAmount = async () => {
    winston.debug('statisticsService.countTotalLoanedAmount -- start');
    const result = await countLoanedAmount();
    if (!result) {
        winston.warn('statisticsService.countTotalLoanedAmount -- could not count loaned amount');
        throw new GeneralException();
    }
    winston.debug('statisticsService.countTotalLoanedAmount -- success');
    return result;
};

/**
 * Get total money from the orders.
 */
const countTotalOrderedAmount = async () => {
    winston.debug('statisticsService.countTotalOrderedAmount -- start');
    const result = await countOrderedAmount();
    if (!result) {
        winston.warn('statisticsService.countTotalOrderedAmount -- could not count ordered amount');
        throw new GeneralException();
    }
    winston.debug('statisticsService.countTotalOrderedAmount -- start');
    return result;
};

const getStatsForSingleProduct = async filters => {
    winston.debug('statisticsService.getStatsForSingleProduct -- start');
    if (!filters) {
        throw new GeneralException();
    }

    if (filters.fullName) {
        const productOption = await findProductOptionByFullName(filters.fullName);
        if (productOption) {
            filters.manufacturer = productOption.product.manufacturer;
            filters.model = productOption.product.model;
            filters.identificator = productOption.identificator;
        }
    }

    const [totalOrdered, totalOrderedAmount, totalLoaned, totalLoanedAmount] = await Promise.all([
        countOrdersWithFilters(filters),
        countOrderedAmount(filters),
        countLoanRequestsWithFilters(filters),
        countLoanedAmount(filters),
    ]);
    winston.debug('statisticsService.getStatsForSingleProduct -- success');
    return {
        totalOrdered,
        totalOrderedAmount: totalOrderedAmount && totalOrderedAmount.length ? totalOrderedAmount[0].sum : 0,
        totalLoaned,
        totalLoanedAmount: totalLoanedAmount && totalLoanedAmount.length ? totalLoanedAmount[0].sum : 0,
    };
};

module.exports = {
    countLoanedProductsById,
    countLoanedProductsManufacturers,
    countLoanRequestsFromTo,
    countTotalLoanedAmount,
    countOrderedProductsById,
    countOrderedProductsByManufacturer,
    countOrdersFromTo,
    countTotalOrderedAmount,
    getStatsForSingleProduct,
};
