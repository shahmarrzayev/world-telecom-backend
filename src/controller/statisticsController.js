const winston = require('winston');

const { validateLoanRequestsFromTo } = require('./validator/statisticsValidator');
const { BadRequestException } = require('../exceptions');
const {
    countLoanedProductsById,
    countLoanedProductsManufacturers,
    countLoanRequestsFromTo,
    countOrderedProductsById,
    countOrderedProductsByManufacturer,
    countOrdersFromTo,
    countTotalLoanedAmount,
    countTotalOrderedAmount,
    getStatsForSingleProduct,
} = require('../service/statisticsService');

const getStatisticsController = async (req, res) => {
    winston.debug('statisticsController.getStatistics -- start');
    const requestBody = req.body;
    const error = validateLoanRequestsFromTo(requestBody);
    if (error) {
        winston.warn(`statisticsController.getStatistics --${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const [
        loanedProductsCount,
        loanedProductsCountByBrand,
        loanedProductsByMonth,
        orderedProductsCount,
        orderedProductsCountByBrand,
        orderedProductsCountByMonth,
        totalLoanedAmount,
        totalOrderedAmount,
    ] = await Promise.all([
        countLoanedProductsById(),
        countLoanedProductsManufacturers(),
        countLoanRequestsFromTo(requestBody),
        countOrderedProductsById(),
        countOrderedProductsByManufacturer(),
        countOrdersFromTo(requestBody),
        countTotalLoanedAmount(),
        countTotalOrderedAmount(),
    ]);
    winston.debug('statisticsController.getStatistics -- success');
    return res.send({
        loanedProductsCount,
        loanedProductsCountByBrand,
        loanedProductsByMonth,
        orderedProductsCount,
        orderedProductsCountByBrand,
        orderedProductsCountByMonth,
        totalLoanedAmount,
        totalOrderedAmount,
    });
};

const getStatsForSingleProductController = async (req, res) => {
    winston.debug('statisticsController.getStatsForSingleProduct -- start');
    const stats = await getStatsForSingleProduct(req.query);
    winston.debug('statisticsController.getStatsForSingleProduct -- success');
    return res.send(stats);
};

module.exports = {
    getStatisticsController,
    getStatsForSingleProductController,
};
