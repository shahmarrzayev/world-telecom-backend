const { isArray } = require('lodash');
const winston = require('winston');

const { Cache } = require('../enums');
const { GeneralException, NotFoundException } = require('../exceptions');
const { updateCustomer } = require('../repository/customerRepository');
const { findNumberById, findManyNumbersByIds } = require('../repository/numberRepository');
const { findProductOptionById, findProductOptionsByIds } = require('../repository/productOptionRepository');
const { getFromCache, flushCache, setInCache } = require('../utils/cacheUtils');

/**
 * Add number to favorites.
 * @param {CustomerEntity} customer
 * @param {ObjectId} numberId
 * @returns {Promise<CustomerEntity>}
 */
const addNumberToFavorites = async (customer, numberId) => {
    winston.debug('customerFavoritesService.addNumberToFavorites -- start');
    if (!customer || !numberId) {
        winston.warn('customerFavoritesService.addNumberToFavorites -- invalid args');
        throw new GeneralException();
    }

    const { favoriteCart } = customer;
    const numberItem = isArray(favoriteCart) ? favoriteCart.find(i => i.productOptionId === numberId) : null;
    if (numberItem) {
        winston.debug('customerFavoritesService.addNumberToFavorites -- already in cart');
        return customer;
    }

    const number = await findNumberById(numberId);
    if (!number) {
        winston.debug('customerFavoritesService.addNumberToFavorites -- not found');
        throw new NotFoundException();
    }

    favoriteCart.push({ numberId });

    const customerEntity = await updateCustomer(customer._id, customer);
    if (!customerEntity) {
        winston.warn('customerFavoritesService.addNumberToFavorites -- could not update');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('customerFavoritesService.addNumberToFavorites -- success');
    return customerEntity;
};

/**
 * Add ro
 * @param {CustomerEntity} customer
 * @param {ObjectId} optionId
 * @returns {Promise<CustomerEntity>}
 */
const addProductToFavorites = async (customer, optionId) => {
    winston.debug('customerFavoritesService.addProductToFavorites -- start');
    if (!customer || !optionId) {
        winston.warn('customerFavoritesService.addProductToFavorites -- invalid args');
        throw new GeneralException();
    }

    const { favoriteCart } = customer;
    const optionItem = isArray(favoriteCart) ? favoriteCart.find(i => i.productOptionId === optionId) : null;
    if (optionItem) {
        winston.debug('customerFavoritesService.addProductToFavorites -- already in cart');
        return customer;
    }

    const productOption = await findProductOptionById(optionId);
    if (!productOption) {
        winston.warn('customerFavoritesService.addProductToFavorites -- not found');
        throw new NotFoundException();
    }

    favoriteCart.push({
        productId: productOption.productId,
        productOptionId: productOption._id,
    });

    const customerEntity = await updateCustomer(customer._id, customer);
    if (!customerEntity) {
        winston.warn('customerFavoritesService.addProductToFavorites -- could not update');
        throw new GeneralException();
    }
    flushCache();
    winston.debug('customerFavoritesService.addProductToFavorites -- success');
    return customerEntity;
};

const addManyProductsToFavorites = async (customer, optionIds) => {
    winston.debug('customerFavoritesService.addManyProductsToFavorite -- start');
    let customerEntity;
    for (let i=0; i<optionIds.length; i++){
        customerEntity = await addProductToFavorites(customer, optionIds[i]);
    }
    winston.debug('customerFavoritesService.addManyProductsToFavorite -- success');
    return customerEntity;
}

/**
 * Clear customer favorites cart.
 * @param {CustomerEntity} customer
 * @returns {Promise<CustomerEntity>}
 */
const clearFavorites = async customer => {
    winston.debug('customerFavoritesService.clearFavorites -- start');
    if (!customer) {
        winston.warn('customerFavoritesService.clearFavorites -- invalid args');
        throw new GeneralException();
    }

    customer.favoriteCart = [];

    const customerEntity = await updateCustomer(customer._id, customer);
    if (!customerEntity) {
        winston.warn('customerFavoritesService.clearFavorites -- could not update');
        throw new GeneralException();
    }
    flushCache();
    winston.debug('customerFavoritesService.clearFavorites -- success');
    return customerEntity;
};

/**
 * Get items in the favorites cart.
 * @param {CustomerEntity} customer
 * @returns {Promise<{numbers, productOptions}>}
 */
const getAllFavorites = async customer => {
    winston.debug('customerFavoritesService.getAllFavorites -- start');
    if (!customer) {
        winston.warn('customerFavoritesService.getAllFavorites -- invalid args');
        throw new GeneralException();
    }

    const inCache = getFromCache(`${Cache.CUSTOMER_FAVORITES}--${customer.id}`);
    if (inCache) {
        winston.debug('customerFavoritesService.getAllFavorites -- success');
        return inCache;
    }

    const { favoriteCart } = customer;
    if (!favoriteCart || !favoriteCart.length) {
        winston.debug('customerFavoritesService.getAllFavorites -- empty favorites');
        return [];
    }

    const numberIds = favoriteCart.map(i => i.numberId);
    const productOptionIds = favoriteCart.map(i => i.productOptionId);
    const [numbers, productOptions] = await Promise.all([
        findManyNumbersByIds(numberIds),
        findProductOptionsByIds(productOptionIds),
        
    ]);
    if (!numbers && !productOptions) {
        winston.debug('customerFavoritesService.getAllFavorites -- could not get items');
        return [];
    }

    setInCache(`${Cache.CUSTOMER_FAVORITES}--${customer.id}`, { numbers, productOptions });
    winston.debug('customerFavoritesService.getAllFavorites -- success');
    return { numbers, productOptions };
};

/**
 * Remove product option OR number from favorites cart.
 * @param {CustomerEntity} customer
 * @param {ObjectId} id
 * @returns {Promise<CustomerEntity>}
 */
const removeItemFromFavorites = async (customer, id) => {
    winston.debug('customerFavoritesService.removeItemFromFavorites -- start');
    if (!customer) {
        winston.warn('customerFavoritesService.removeItemFromFavorites -- invalid args');
        throw new GeneralException();
    }

    customer.favoriteCart = customer.favoriteCart.filter(i => i.productOptionId !== id && i.numberId !== id);

    const customerEntity = await updateCustomer(customer._id, customer);
    if (!customerEntity) {
        winston.warn('customerFavoritesService.removeItemFromFavorites -- could not update');
        throw new GeneralException();
    }
    flushCache();
    winston.debug('customerFavoritesService.removeItemFromFavorites -- success');
    return customerEntity;
};

module.exports = {
    addNumberToFavorites,
    addProductToFavorites,
    addManyProductsToFavorites,
    clearFavorites,
    getAllFavorites,
    removeItemFromFavorites,
};
