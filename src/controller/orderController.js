const winston = require('winston');

const { validateModifyOrder, validateRegisterOrder } = require('./validator/orderValidator');
const { PaymentType } = require('../enums');
const { BadRequestException } = require('../exceptions');
const { mapOrderEntityToOrderView } = require('../mapper/orderMapper');
const { getManyOrders, getOrderById, modifyOrder, registerOrder } = require('../service/orderService');
const {
    createNewAzericardPayment,
    createNewPashaBankPayment,
    createNewYigimPayment,
    createNewUnibankPayment,
} = require('../service/paymentService');

/**
 * Get orders with cash payment.
 */
const getCashPaidOrdersController = async (req, res) => {
    winston.debug('orderController.getCashPaidOrders -- start');
    const { query } = req;
    query.paymentType = PaymentType.CASH;
    const response = await getManyOrders(query);
    response.orders = response.orders.map(mapOrderEntityToOrderView);
    winston.debug('orderController.getCashPaidOrders -- success');
    return res.send(response);
};

/**
 * Get orders with online payment.
 */
const getOnlinePaidOrdersController = async (req, res) => {
    winston.debug('orderController.getOnlinePaidOrders -- start');
    const { query } = req;
    query.paymentType = PaymentType.ONLINE;
    const response = await getManyOrders(query);
    response.orders = response.orders.map(mapOrderEntityToOrderView);
    winston.debug('orderController.getOnlinePaidOrders -- success');
    return res.send(response);
};

/**
 * Get order by id.
 */
const getOrderByIdController = async (req, res) => {
    winston.debug('orderController.getOrderByIdController -- start');
    const orderEntity = await getOrderById(req.params.id);
    winston.debug('orderController.getOrderByIdController -- success');
    return res.send(mapOrderEntityToOrderView(orderEntity));
};

/**
 * Get ordered numbers.
 */
const getOrderedNumbersController = async (req, res) => {
    winston.debug('orderController.getOrderedNumbers -- start');
    const response = await getManyOrders(req.query, true);
    winston.debug('orderController.getOrderedNumbers -- success');
    return res.send(response);
};

/**
 * Modify order (limited fields).
 */
const modifyOrderController = async (req, res) => {
    winston.debug('orderController.modifyOrderController -- start');
    const { body, params, user } = req;
    const error = validateModifyOrder(body);
    if (error) {
        winston.warn(`orderController.modifyOrderController -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const order = await modifyOrder(params.id, req.body, user._id);
    winston.debug('orderController.modifyOrderController -- success');
    return res.send(mapOrderEntityToOrderView(order));
};

/**
 * Register new order.
 */
const registerOrderController = async (req, res) => {
    winston.debug('orderController.registerOrder -- start');
    const { body, transaction } = req;
    const error = validateRegisterOrder(body);
    if (error) {
        winston.warn(`orderController.registerOrder -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }

    const { installmentPeriod } = body;
    const orderEntity = await registerOrder(body, transaction);

    let paymentUrl;
    if (orderEntity.paymentType === PaymentType.ONLINE) {
        paymentUrl = await createNewYigimPayment(orderEntity, transaction);
    } else if (orderEntity.paymentType === PaymentType.ONLINE_AZERICARD) {
        await createNewAzericardPayment(orderEntity, transaction);
    } else if (orderEntity.paymentType === PaymentType.ONLINE_PASHA_BANK) {
        orderEntity.installmentPeriod = installmentPeriod;
        paymentUrl = await createNewPashaBankPayment(orderEntity, req.ip, transaction);
    } else if (orderEntity.paymentType === PaymentType.ONLINE_UNIBANK) {
        paymentUrl = await createNewUnibankPayment(orderEntity, transaction);
    }

    const orderView = mapOrderEntityToOrderView(orderEntity);
    orderView.paymentUrl = paymentUrl;
    winston.debug('orderController.registerOrder -- success');
    return res.send(orderView);
};

module.exports = {
    getCashPaidOrdersController,
    getOnlinePaidOrdersController,
    getOrderByIdController,
    getOrderedNumbersController,
    modifyOrderController,
    registerOrderController,
};
