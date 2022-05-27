const { isArray } = require('lodash');
const winston = require('winston');

const { getAvailableNumbersFromCart, getPublishedProductOptionsFromCart } = require('./helper/customerCartHelper');
const { Cache } = require('../enums');
const { GeneralException, NotFoundException } = require('../exceptions');
const { updateCustomer } = require('../repository/customerRepository');
const { findNumberById } = require('../repository/numberRepository');
const { findProductOptionById } = require('../repository/productOptionRepository');
const { registerOrder } = require('../service/orderService');
const { getFromCache, flushCache, setInCache } = require('../utils/cacheUtils');

/**
 * Adds number to customer's cart.
 * @param {CustomerEntity} customer
 * @param {ObjectId} numberId
 * @returns {Promise<CustomerEntity>}
 */
const addNumberToCart = async (customer, numberId) => {
    winston.debug('customerCartService.addNumberToCart -- start');
    if (!customer || !numberId) {
        winston.warn('customerCartService.addNumberToCart -- invalid args');
        throw new GeneralException();
    }

    if (customer.cart && customer.cart.length) {
        const numberExists = customer.cart.find(c => c.numberId === numberId);
        if (numberExists) {
            winston.debug('customerCartService.addNumberToCart -- success');
            return customer;
        }
    }

    const number = await findNumberById(numberId);
    if (!number) {
        winston.debug('customerCartService.addNumberToCart -- number not found');
        throw new NotFoundException();
    }

    customer.cart.push({
        numberId,
        count: 1,
    });

    const customerEntity = await updateCustomer(customer._id, customer);
    if (!customerEntity) {
        winston.warn('customerCartService.addNumberToCart -- could not update');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('customerCartService.addNumberToCart -- success');
    return customerEntity;
};

/**
 * Add product option to customer cart.
 * @param {CustomerEntity} customer
 * @param {ObjectId} optionId
 * @returns {Promise<CustomerEntity>}
 */
const addOptionToCart = async (customer, optionId) => {
    winston.debug('customerCartService.addOptionToCart -- start');
    if (!customer || !optionId) {
        winston.warn('customerCartService.addOptionToCart -- invalid args');
        throw new GeneralException();
    }

    const { cart } = customer;
    let option = cart && cart.length ? cart.find(o => o.productOptionId === optionId) : null;
    if (option) {
        option.count += 1;
    } else {
        option = await findProductOptionById(optionId);
        if (!option) {
            winston.warn('customerCartService.addOptionToCart -- option not found');
            throw new NotFoundException();
        }
        cart.push({
            productId: option.productId,
            productOptionId: option._id,
            count: 1,
        });
    }

    const customerEntity = await updateCustomer(customer._id, customer);
    if (!customerEntity) {
        winston.warn('customerCartService.addOptionToCart -- could not update');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('customerCartService.addOptionToCart -- success');
    return customerEntity;
};

/**
 * Clear customer cart.
 * @param {CustomerEntity} customer
 * @returns {Promise<CustomerEntity>}
 */
const clearCart = async (customer, transaction) => {
    winston.debug('customerCartService.clearCart -- start');
    if (!customer) {
        winston.warn('customerCartService.clearCart -- invalid args');
        throw new GeneralException();
    }

    customer.cart = [];

    const customerEntity = await updateCustomer(customer._id, customer, transaction);
    if (!customerEntity) {
        winston.warn('customerCartService.clearCart -- could not update');
        throw new GeneralException();
    }
    winston.debug('customerCartService.clearCart -- success');
    return customerEntity;
};

/**
 * Get customer's cart.
 * @param {CustomerEntity} customer
 * @returns {Promise<CustomerEntity>}
 */
const getCustomerCart = async customer => {
    winston.debug('customerCartService.getCustomerCart -- start');
    if (!customer) {
        winston.warn('customerCartService.getCustomerCart -- invalid args');
        throw new GeneralException();
    }

    const cartInCache = getFromCache(`${Cache.CUSTOMER_CART}-${customer._id}`);
    if (cartInCache) {
        winston.debug('customerCartService.getCustomerCart -- success');
        return cartInCache;
    }

    const cart = customer.cart.toObject();

    if (!isArray(cart) || !cart.length) return [];

    const cartProductOptions = cart.filter(c => !c.numberId);
    const cartNumbers = cart.filter(c => c.numberId);
    
    const [options, numbers] = await Promise.all([
        getPublishedProductOptionsFromCart(cartProductOptions),
        getAvailableNumbersFromCart(cartNumbers),
    ]);
    if (!options && !numbers) {
        winston.warn('customerCartService.getCustomerCart -- could not get');
        throw new GeneralException();
    }

    const publishedCart = { productOptions: options, numbers };

    setInCache(`${Cache.CUSTOMER_CART}-${customer._id}`, publishedCart);
    winston.debug('customerCartService.getCustomerCart -- success');
    return publishedCart;
};

/**
 * Checkout customer cart - register order.
 * @param {CustomerEntity} customer
 * @param {PaymentType} paymentType
 * @param {Number} installmentPeriod?
 * @returns {Promise<CustomerEntity>}
 */
const checkoutCustomerCart = async (customer, paymentType, installmentPeriod, transaction) => {
    winston.debug('customerCartService.checkoutCustomerCart -- start');
    if (!customer || !paymentType) {
        winston.warn('customerCartService.checkoutCustomerCart -- invalid args');
        throw new GeneralException();
    }

    const { numbers, productOptions } = (await getCustomerCart(customer)) || {};

    const orderedNumbers =
        numbers && numbers.length ? numbers.map(n => ({ _id: n.numberId, count: n.count, selectedCampaigns: [] })) : [];

    const orderedProductOptions =
        productOptions && productOptions.length
            ? productOptions.map(p => ({ _id: p.productOptionId, count: p.count, selectedCampaigns: [] }))
            : [];

    const orderView = {
        customerId: customer._id,
        name: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        mobilePhone: customer.mobilePhone,
        paymentType,
        orderedNumbers,
        orderedProductOptions,
        installmentPeriod,
    };

    const orderEntity = await registerOrder(orderView, transaction);

    await clearCart(customer, transaction);
    winston.debug('customerCartService.checkoutCustomerCart -- success');
    return orderEntity;
};

/**
 * Remove product option from customer's cart.
 * @param {CustomerEntity} customer
 * @param {ObjectId} optionOrNumberId
 * @returns {Promise<CustomerEntity>}
 */
const removeItemFromCart = async (customer, optionOrNumberId) => {
    winston.debug('customerCartService.removeItemFromCart -- start');
    if (!customer || !optionOrNumberId) {
        winston.warn('customerCartService.removeItemFromCart -- invalid args');
        throw new GeneralException();
    }

    const { cart } = customer;
    if (!isArray(cart) || !cart.length) {
        winston.debug('customerCartService.removeItemFromCart -- success');
        return customer;
    }

    const cartItem = cart.find(o => o.productOptionId === optionOrNumberId || o.numberId === optionOrNumberId);
    if (!cartItem) {
        winston.debug('customerCartService.removeItemFromCart -- success');
        return customer;
    }

    cartItem.count -= 1;
    if (cartItem.count <= 0) {
        customer.cart = cart.filter(o => o.productOptionId !== optionOrNumberId && o.numberId !== optionOrNumberId);
    }
    const customerEntity = await updateCustomer(customer._id, customer);
    flushCache();
    winston.debug('customerCartService.removeItemFromCart -- success');
    return customerEntity;
};

const clearItemFromCart = async (customer, optionId) => {
    winston.debug('customerCartService.clearItemFromCart -- start');
    if (!customer || !optionId) {
        winston.warn('customerCartService.clearItemFromCart -- invalid args');
        throw new GeneralException();
    }

    const { cart } = customer;
    let option = cart && cart.length ? cart.find(o => o.productOptionId === optionId) : null;
    if (option) {
        option.count = 0;
        customer.cart = cart.filter(o => o.productOptionId !== optionId && o.numberId !== optionId);
    } else {
        winston.debug('customerCartService.clearItemFromCart -- success');
        return customer;
    }

    const customerEntity = await updateCustomer(customer._id, customer);
    if (!customerEntity) {
        winston.warn('customerCartService.clearItemFromCart -- could not update');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('customerCartService.clearItemFromCart -- success');
    return customerEntity;
}


module.exports = {
    addNumberToCart,
    addOptionToCart,
    checkoutCustomerCart,
    clearCart,
    getCustomerCart,
    removeItemFromCart,
    clearItemFromCart
};
