const winston = require('winston');

const { NumberStatus } = require('../../enums');
const { findManyNumbersByIds } = require('../../repository/numberRepository');
const { findProductOptionsByIds } = require('../../repository/productOptionRepository');

/**
 * Get numbers that are in cart (only available ones).
 * @param {Array<{numberId, count}>} cartNumberItems
 * @returns {Promise<Array<{numberId, number, count}>>}
 */
const getAvailableNumbersFromCart = async cartNumberItems => {
    winston.debug('customerCartHelper.getAvailableNumbersFromCart -- start');
    if (!cartNumberItems || !cartNumberItems.length) {
        winston.debug('customerCartHelper.getAvailableNumbersFromCart -- empty options');
        return [];
    }

    const numbers = await findManyNumbersByIds(cartNumberItems.map(n => n.numberId));
    if (!numbers) {
        winston.warn('customerCartHelper.getAvailableNumbersFromCart -- could not get');
        return [];
    }

    cartNumberItems.forEach(n => {
        n.number = numbers.find(p => p._id.equals(n.numberId));
    });

    winston.debug('customerCartHelper.getAvailableNumbersFromCart -- success');
    return cartNumberItems.filter(n => n.number.status === NumberStatus.AVAILABLE);
};

/**
 * Get numbers that are in cart (only available ones).
 * @param {CustomerCartItem(productId, productOptionId, count)} cartNumberItems
 * @returns {Promise<Array<{productId, productOptionId, product, count}>>}
 */
const getPublishedProductOptionsFromCart = async cartProductOptionItems => {
    winston.debug('customerCartHelper.getPublishedProductOptionsFromCart -- start');
    if (!cartProductOptionItems || !cartProductOptionItems.length) {
        winston.debug('customerCartHelper.getPublishedProductOptionsFromCart -- empty options');
        return [];
    }

    const options = await findProductOptionsByIds(cartProductOptionItems.map(c => c.productOptionId));
    if (!options) {
        winston.warn('customerCartHelper.getPublishedProductOptionsFromCart -- could not get');
        return [];
    }

    cartProductOptionItems.forEach(o => {
        o.product = options.find(p => p._id.equals(o.productOptionId));
    });

    winston.debug('customerCartHelper.getPublishedProductOptionsFromCart -- success');
    return cartProductOptionItems.filter(o => o.product && o.product.published);
};

module.exports = {
    getAvailableNumbersFromCart,
    getPublishedProductOptionsFromCart,
};
