const winston = require('winston');

const { getAllCampaigns } = require('./campaignService');
const {
    assignOrderedNumbers,
    assignOrderedProductOptions,
    getFilterParamsFromRequestQuery,
    calculateTotalPrice,
} = require('./helper/orderHelper');
const { OrderStatus, PaymentType } = require('../enums');
const { GeneralException, NotFoundException } = require('../exceptions');
const { mapOrderViewToOrderEntity } = require('../mapper/orderMapper');
const {
    countOrdersByQuery,
    findManyOrders,
    findOrderById,
    saveOrder,
    updateOrder,
} = require('../repository/orderRepository');
const { flushCache } = require('../utils/cacheUtils');

/**
 * Cancels order and reverts payment for it.
 * @param {ObjectId} id
 * @param {ObjectId} userId
 * @returns {Promise<OrderEntity>}
 */
const cancelOnlineOrder = async (id, userId) => {
    winston.debug('orderService.cancelOnlineOrder -- start');
    if (!id || !userId) {
        winston.warn(`orderService.cancelOnlineOrder -- null param: ${id}, ${userId}`);
        throw new GeneralException();
    }

    let orderEntity = await findOrderById(id);
    if (!orderEntity || orderEntity.paymentType !== PaymentType.ONLINE) {
        winston.error('orderService.cancelOnlineOrder -- order not found');
        throw new NotFoundException('Sifariş tapılmadı');
    }

    orderEntity.updatedBy = userId;
    orderEntity = await updateOrder(id, { orderStatus: OrderStatus.CANCELED });
    winston.debug('orderService.cancelOnlineOrder -- success');
    return orderEntity;
};

/**
 * Get many orders with filters.
 * @param {Request.query} requestQuery
 * @param {Boolean} onlyNumbers
 * @returns {Promise<Object>} {limit, orders, page, total}
 */
const getManyOrders = async (requestQuery, onlyNumbers) => {
    winston.debug('orderService.getManyOrders -- start');
    if (!requestQuery) {
        winston.warn('orderService.getManyOrders -- null param');
        throw new GeneralException();
    }

    const filterDetails = getFilterParamsFromRequestQuery(requestQuery);
    filterDetails.onlyNumbers = onlyNumbers;
    const { query, orders } = (await findManyOrders(filterDetails)) || {};
    if (!query || !orders) {
        winston.warn('orderService.getManyOrders -- could not get orders');
        throw new GeneralException();
    }

    const total = await countOrdersByQuery(query);
    if (total !== 0 && !total) {
        winston.warn('orderService.getManyOrders -- could not count orders');
        throw new GeneralException();
    }
    winston.debug('orderService.getManyOrders -- success');
    return {
        limit: filterDetails.limit,
        orders,
        page: filterDetails.page,
        total,
    };
};

/**
 * Get order by id.
 * @param {String} id
 * @returns {Promise<OrderEntity>}
 */
const getOrderById = async id => {
    winston.debug('orderService.getOrderById -- start');
    if (!id) {
        winston.warn('orderService.getOrderById -- null param');
        throw new GeneralException();
    }
    const orderEntity = await findOrderById(id);
    if (!orderEntity) {
        winston.warn('orderService.getOrderById -- order not found');
        throw new NotFoundException('Məhsul tapılmadı');
    }
    winston.debug('orderService.getOrderById -- success');
    return orderEntity;
};

/**
 * Update order.
 * @param {String} id
 * @param {OrderView} orderView
 * @param {String} userId
 * @returns {Promise<OrderEntity>}
 */
const modifyOrder = async (id, orderView, userId) => {
    winston.debug('orderService.modifyOrder -- start');
    if (!id || !orderView || !userId) {
        winston.warn(`orderService.modifyOrder -- null param: ${id}, ${orderView}, ${userId}`);
        throw new GeneralException();
    }

    let orderEntity = await findOrderById(id);
    if (!orderEntity) {
        winston.error('orderService.modifyOrder -- order not found');
        throw new NotFoundException('Sifariş tapılmadı');
    }

    orderView.updatedBy = userId;
    delete orderView._id;
    orderEntity = await updateOrder(id, orderView);
    if (!orderEntity) {
        winston.warn('orderService.modifyOrder -- could not update order');
        throw new GeneralException();
    }
    winston.debug('orderService.modifyOrder -- success');
    return orderEntity;
};

/**
 * Registers order and creates payment if necessary.
 * @param {OrderView} orderView
 * @param {Transaction} transaction
 * @returns {Promise<OrderEntity>}
 */
const registerOrder = async (orderView, transaction) => {
    winston.debug('orderService.registerOrder -- start');
    if (!orderView) {
        winston.warn('orderService.registerOrder -- null param');
        throw new GeneralException();
    }

    const campaigns = await getAllCampaigns();
    if (!campaigns) {
        winston.warn('orderService.registerOrder -- could not get campaigns');
        throw new GeneralException();
    }

    let orderEntity = mapOrderViewToOrderEntity(orderView);

    const [orderedNumbers, orderedProductOptions] = await Promise.all([
        assignOrderedNumbers(orderEntity.orderedNumbers, campaigns),
        assignOrderedProductOptions(orderEntity.orderedProductOptions, orderView, campaigns),
    ]);
    if (!orderedProductOptions && !orderedNumbers) {
        winston.warn('orderService.registerOrder -- product option/number not found');
        throw new NotFoundException('Məhsul tapılmadı');
    }

    orderEntity.orderedNumbers = orderedNumbers || [];
    orderEntity.orderedProductOptions = orderedProductOptions || [];
    orderEntity.totalPrice = calculateTotalPrice(orderEntity);

    orderEntity = await saveOrder(orderEntity, transaction);
    if (!orderEntity) {
        winston.warn('orderService.registerOrder -- could not save order');
        throw new GeneralException();
    }
    
    flushCache();
    winston.debug('orderService.registerOrder -- success');
    return orderEntity;
};

module.exports = {
    cancelOnlineOrder,
    getManyOrders,
    getOrderById,
    modifyOrder,
    registerOrder,
};
