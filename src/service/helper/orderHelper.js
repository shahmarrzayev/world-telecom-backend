const { cloneDeep } = require('lodash');
const winston = require('winston');

const { calculateCampaignPriceForProduct } = require('./campaignHelper');
const { sendMail } = require('../../client/mailClient');
const { Env } = require('../../enums');
const {
    mapNumberEntitiesToOrderedNumbers,
    mapProductOptionEntitiesToOrderedProductOptions,
} = require('../../mapper/orderMapper');
const { findManyNumbersByIds } = require('../../repository/numberRepository');
const { findProductOptionsByIds } = require('../../repository/productOptionRepository');
const { getFromEnv } = require('../../utils/commonUtils');

/**
 * PRIVATE
 * @param {Array<OrderedProductOption | OrderedNumber>} items
 * @param {Array<CampaignEntity>} campaigns
 * Calculates and sets all the campaigns and their prices for ordered item.
 */
const setOrderedItemsCampaigns = (items, campaigns) => {
    winston.debug('orderHelper.setOrderedItemsCampaigns -- start');
    if (!items || !items.length || !campaigns || !campaigns.length) {
        winston.debug('orderHelper.setOrderedItemsCampaigns -- no campaigns, returning');
        return;
    }
    items.forEach(item => {
        if (item.selectedCampaigns && item.selectedCampaigns.length) {
            item.selectedCampaigns = item.selectedCampaigns.map(campaignId => {
                return {
                    _id: campaignId,
                    price: calculateCampaignPriceForProduct(campaigns, campaignId, item.price),
                };
            });
        }
    });
    winston.debug('orderHelper.setOrderedItemsCampaigns -- success');
};

/**
 * Checks, maps and sets ordered numbers
 * @param {Array<OrderedNumber>} orderedNumbers
 * @param {Array<Campaigns>} campaigns
 * @returns {Promise<Array<OrderedNumbers>>}
 */
const assignOrderedNumbers = async (orderedNumbers, campaigns) => {
    winston.debug('orderHelper.setOrderedNumbers -- start');
    if (!orderedNumbers || !orderedNumbers.length || !campaigns) {
        winston.debug('orderHelper.setOrderedNumbers -- null param');
        return null;
    }

    let ordered = cloneDeep(orderedNumbers);

    const numberEntities = await findManyNumbersByIds(ordered.map(on => on._id));
    if (!numberEntities || !numberEntities.length || numberEntities.length !== orderedNumbers.length) {
        winston.warn('orderHelper.setOrderedNumbers -- number not found');
        return null;
    }

    ordered = mapNumberEntitiesToOrderedNumbers(numberEntities, ordered);
    setOrderedItemsCampaigns(ordered, campaigns);
    winston.debug('orderHelper.setOrderedNumbers -- success');
    return ordered;
};

/**
 * Checks, maps and sets ordered product options
 * @param {Array<OrderedProductOptions>} orderEntity
 * @param {OrderView} orderView
 * @param {Array<CampaignEntity>} campaigns
 * @returns {Promise<Array<OrderedProductOptions>>}
 */
const assignOrderedProductOptions = async (orderedProductOptions, orderView, campaigns) => {
    winston.debug('orderHelper.setOrderedProductOptions -- start');
    if (!orderedProductOptions || !orderedProductOptions.length || !orderView || !campaigns) {
        winston.debug('orderHelper.setOrderedProductOptions -- null param');
        return null;
    }

    let orderedOptions = cloneDeep(orderedProductOptions);

    const productOptionEntities = await findProductOptionsByIds(orderedOptions.map(o => o._id));
    if (!productOptionEntities || productOptionEntities.length !== orderView.orderedProductOptions.length) {
        winston.warn('orderHelper.setOrderedProductOptions -- product option not found');
        return null;
    }
    if (productOptionEntities.find(p => !p.price || !p.published)) {
        winston.warn('orderHelper.setOrderedProductOptions -- someone trying to get 0 price/!published product option');
        return null;
    }
    orderedOptions = mapProductOptionEntitiesToOrderedProductOptions(productOptionEntities, orderedOptions);
    setOrderedItemsCampaigns(orderedOptions, campaigns);
    winston.debug('orderHelper.setOrderedProductOptions -- success');
    return orderedOptions;
};

/**
 * Returns filter parameters for querying.
 */
const getFilterParamsFromRequestQuery = query => {
    if (!query) return null;
    return {
        name: query.name,
        lastName: query.lastName,
        email: query.email,
        mobile: query.mobile,
        paymentType: query.paymentType,
        productOptionId: query.productOptionId,
        orderStatus: query.orderStatus,
        minPrice: parseFloat(query.minPrice),
        maxPrice: parseFloat(query.maxPrice),
        operator: query.operator,
        number: query.number,
        page: parseInt(query.page, 10) || 1,
        limit: parseInt(query.limit, 10) || 10,
    };
};

/**
 * PRIVATE
 * Calculates price for ordered item.
 * @param {OrderedProductOption | OrderedNumber} item
 * @returns {Number}
 */
const calculateProductItemPrice = item => {
    if (!item) return 0;

    let price = 0;
    if (item.selectedLoan) {
        price += item.selectedLoan.price;
    } else if (item.discount && item.discount.price) {
        price = item.count ? price + item.discount.price * item.count : price + item.discount.price;
    } else {
        price = item.count ? price + item.price * item.count : price + item.price;
    }

    if (item.selectedCampaigns && item.selectedCampaigns.length) {
        item.selectedCampaigns.forEach(c => {
            price = c.price ? price - c.price : price;
        });
    }

    return price;
};

/**
 * Returns total price of given product options.
 */
const calculateTotalPrice = orderEntity => {
    winston.debug('orderHelper.calculateTotalPrice -- start');
    if (!orderEntity) {
        winston.warn('orderHelper.calculateTotalPrice -- null param');
        return null;
    }

    let totalPrice = 0;
    const { orderedNumbers, orderedProductOptions } = orderEntity;

    if (orderedProductOptions && orderedProductOptions.length) {
        orderedProductOptions.forEach(p => {
            totalPrice += calculateProductItemPrice(p);
        });
    }

    if (orderedNumbers && orderedNumbers.length) {
        orderedNumbers.forEach(n => {
            totalPrice += calculateProductItemPrice(n);
        });
    }
    winston.debug('orderHelper.calculateTotalPrice -- success');
    return totalPrice;
};

/**
 * Checks if order can be paid online.
 * @param {OrderEntity} orderEntity
 * @returns {Boolean}
 */
const checkOrderCanBePaidOnline = (orderedProductOptions, orderedNumbers) => {
    winston.debug('orderHelper.checkOrderCanBePaidOnline -- start');
    if (orderedProductOptions && orderedProductOptions.length && (!orderedNumbers || !orderedNumbers.length)) {
        return (
            orderedProductOptions.length === 1 &&
            orderedProductOptions[0].product &&
            orderedProductOptions[0].product.onlinePaymentEnabled
        );
    }

    // TODO: Check also numbers case
    winston.debug('orderHelper.checkOrderCanBePaidOnline -- success');
    return false;
};

/**
 * Sends mail notification to admin about order.
 * @param {OrderEntity} order
 */
const sendOrderNotificationMail = order => {
    winston.debug('orderHelper.sendOrderNotificationMail -- start');
    if (!order || !order.email) {
        winston.warn('orderHelper.sendOrderNotificationMail -- empty email');
        return;
    }

    const to = getFromEnv(Env.W_T_SENDGRID_ADMIN);
    if (!to) {
        winston.warn('orderHelper.sendOrderNotificationMail -- admin mail not found');
        return;
    }
    const subject = `YENI SİFARİŞ: ${order._id}`;
    const text = `Sifariş Nömrəsi: ${order._id}\nÖdəniş tipi: ${order.paymentType}\nMƏBLƏĞ: ${order.totalPrice}\nMüştərinin adı: ${order.name} ${order.lastName}\nMüştərinin mobil nömrəsi: ${order.mobilePhone}`;
    sendMail(to, subject, text);
    winston.debug('orderHelper.sendOrderNotificationMail -- success');
};

module.exports = {
    assignOrderedNumbers,
    assignOrderedProductOptions,
    getFilterParamsFromRequestQuery,
    calculateTotalPrice,
    checkOrderCanBePaidOnline,
    sendOrderNotificationMail,
};
