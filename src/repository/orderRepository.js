const moment = require('moment');
const winston = require('winston');

const { generateQueryForOrders } = require('./helper/orderRepositoryHelper');
const { getPaginationDetails, runQuery } = require('./helper/repositoryHelper');
const Order = require('./models/orderModel');
const { OrderStatus } = require('../enums');

const countOrderedAmount = async ({ id, manufacturer, model, identificator, from, to } = {}) => {
    winston.debug('orderRepository.countOrderedAmount -- start');
    const match = {};
    if (id) match['orderedProductOptions._id'] = id;
    if (manufacturer) match['orderedProductOptions.manufacturer'] = manufacturer;
    if (model) match['orderedProductOptions.model'] = model;
    if (identificator) match['orderedProductOptions.identificator'] = identificator;
    if (from) match.createdAt = { $gte: moment.utc(from).toDate() };
    if (to) match.createdAt = { ...match.createdAt, $lte: moment.utc(to).toDate() };

    const result = await runQuery(() =>
        Order.aggregate([
            { $match: match },
            { $project: { _id: 0, orderedProductOptions: 1 } },
            { $unwind: '$orderedProductOptions' },
            {
                $group: {
                    _id: null,
                    sum: { $sum: { $toDouble: '$orderedProductOptions.price' } },
                },
            },
        ])
    );
    const resultNumbers = await runQuery(() =>
        Order.aggregate([
            { $match: { orderStatus: OrderStatus.PROCESSED } },
            { $project: { _id: 0, orderedNumbers: 1 } },
            { $unwind: '$orderedNumbers' },
            {
                $group: {
                    _id: null,
                    sum: { $sum: { $toDouble: '$orderedNumbers.price' } },
                },
            },
        ])
    );
    result.sum += resultNumbers.sum;
    winston.debug('orderRepository.countOrderedAmount -- success');
    return result;
};

const countOrderedProducts = async () => {
    winston.debug('orderRepository.countOrderedProducts -- start');
    const result = await runQuery(() =>
        Order.aggregate([
            { $project: { _id: 0, orderedProductOptions: 1 } },
            { $unwind: '$orderedProductOptions' },
            {
                $group: {
                    _id: '$orderedProductOptions._id',
                    manufacturer: { $first: '$orderedProductOptions.manufacturer' },
                    model: { $first: '$orderedProductOptions.model' },
                    identificator: { $first: '$orderedProductOptions.identificator' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ])
    );
    winston.debug('orderRepository.countOrderedProducts -- success');
    return result;
};

const countOrderedProductsBrands = async () => {
    winston.debug('orderRepository.countOrderedProductsBrands -- start');
    const result = await runQuery(() =>
        Order.aggregate([
            { $project: { _id: 0, orderedProductOptions: 1 } },
            { $unwind: '$orderedProductOptions' },
            {
                $group: {
                    _id: '$orderedProductOptions.manufacturer',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ])
    );
    winston.debug('orderRepository.countOrderedProductsBrands -- success');
    return result;
};

const countOrdersByQuery = async (query, transaction) => {
    winston.debug('orderRepository.countOrdersByQuery -- start');
    const count = await runQuery(() => Order.countDocuments(query).session(transaction));
    winston.debug('orderRepository.countOrdersByQuery -- success');
    return count;
};

const countOrdersMonthly = async (startDate, endDate, transaction) => {
    winston.debug('orderRepository.countOrdersMonthly -- start');
    const matchQuery = {};
    if (startDate) matchQuery.$gte = moment(startDate).toDate();
    if (endDate) matchQuery.$lte = moment(endDate).toDate();
    const result = await runQuery(() =>
        Order.aggregate([
            {
                $match: { createdAt: matchQuery },
            },
            {
                $group: {
                    _id: { $substr: ['$createdAt', 0, 7] },
                    total: { $sum: 1 },
                },
            },
        ]).session(transaction)
    );
    winston.debug('orderRepository.countOrdersMonthly -- success');
    return result;
};

const countOrdersWithFilters = async ({ id, manufacturer, model, identificator, from, to } = {}, transaction) => {
    winston.debug('orderRepository.countOrdersWithFilters -- start');
    const query = {};
    if (id) query['orderedProductOptions._id'] = id;
    if (manufacturer) query['orderedProductOptions.manufacturer'] = manufacturer;
    if (model) query['orderedProductOptions.model'] = model;
    if (identificator) query['orderedProductOptions.identificator'] = identificator;
    if (from) query.createdAt = { $gte: moment.utc(from).toDate() };
    if (to) query.createdAt = { ...query.createdAt, $lte: moment.utc(to).toDate() };

    const count = await runQuery(() => Order.countDocuments(query).session(transaction));
    winston.debug('orderRepository.countOrdersWithFilters -- success');
    return count;
};

const findManyOrders = async (filterDetails, transaction) => {
    winston.debug('orderRepository.findManyOrders -- start');
    const query = generateQueryForOrders(filterDetails);
    const { skip } = getPaginationDetails(filterDetails) || {};
    const orders = await runQuery(() =>
        Order.find(query)
            .limit(filterDetails.limit)
            .skip(skip)
            .sort([['createdAt', -1]])
            .session(transaction)
    );
    winston.debug('orderRepository.findManyOrders -- success');
    return { query, orders };
};

const findOrderById = async (id, transaction) => {
    winston.debug('orderRepository.findOrderById -- start');
    if (!id) {
        winston.warn('orderRepository.findOrderById -- null param');
        return null;
    }
    const order = await runQuery(() => Order.findById(id).session(transaction));
    winston.debug('orderRepository.findOrderById -- success');
    return order;
};

const findOrdersByMobilePhone = async (mobilePhone, transaction) => {
    if (!mobilePhone) return null;
    const orders = await runQuery(() =>
        Order.find({ mobilePhone })
            .sort({ createdAt: -1 })
            .session(transaction)
    );
    return orders;
};

const saveOrder = async (order, transaction) => {
    winston.debug('orderRepository.saveOrder -- start');
    if (!order) {
        winston.warn('orderRepository.saveOrder -- null param');
        return null;
    }
    const dbOrder = new Order(order);
    const savedOrder = await runQuery(() => dbOrder.save({ session: transaction }));
    winston.debug('orderRepository.saveOrder -- success');
    return savedOrder;
};

const updateOrder = async (id, order, transaction) => {
    winston.debug('orderRepository.updateOrder -- start');
    if (!id || !order) {
        winston.warn(`orderRepository.updateOrder -- null param: ${id}, ${order}`);
        return null;
    }

    const updatedOrder = await runQuery(() =>
        Order.findByIdAndUpdate(id, order, {
            new: true,
            session: transaction,
            useFindAndModify: false,
        })
    );
    winston.debug('orderRepository.updateOrder -- success');
    return updatedOrder;
};

module.exports = {
    countOrderedAmount,
    countOrderedProducts,
    countOrderedProductsBrands,
    countOrdersByQuery,
    countOrdersMonthly,
    countOrdersWithFilters,
    findManyOrders,
    findOrderById,
    findOrdersByMobilePhone,
    saveOrder,
    updateOrder,
};
