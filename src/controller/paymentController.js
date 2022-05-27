const winston = require('winston');

const { mapOrderEntityToOrderView } = require('../mapper/orderMapper');
const { mapPaymentEntityToPaymentView } = require('../mapper/paymentMapper');
const {
    completePayment,
    getPayment,
    getPaymentDetails,
    getPaymentStatus,
    processAzericardPayment,
    processYigimPayment,
} = require('../service/paymentService');

/**
 * Approve payment.
 */
const approvePaymentController = async (req, res) => {
    winston.debug('paymentController.approvePayment -- start');
    const result = await completePayment(req.params.orderId);
    winston.debug('paymentController.approvePayment -- success');
    return res.send(result);
};

/**
 * Get payment.
 */
const getPaymentController = async (req, res) => {
    winston.debug('paymentController.getPayment -- start');
    const paymentEntity = await getPayment(req.params.orderId);
    winston.debug('paymentController.getPayment -- success');
    return res.send(mapPaymentEntityToPaymentView(paymentEntity));
};

/**
 * Get payment url by order id.
 */
const getPaymentDetailsController = async (req, res) => {
    winston.debug('paymentController.getPaymentDetails -- start');
    const details = await getPaymentDetails(req.params.orderId);
    details.orderInfo = mapOrderEntityToOrderView(details.orderInfo);
    winston.debug('paymentController.getPaymentDetails -- success');
    return res.send(details);
};

/**
 * Get payment status.
 */
const getPaymentStatusController = async (req, res) => {
    winston.debug('paymentController.getPaymentStatus -- start');
    const { order, status } = (await getPaymentStatus(req.params.orderId, req.ip)) || {};
    winston.debug('paymentController.getPaymentStatus -- success');
    return res.send({ orderInfo: mapOrderEntityToOrderView(order), status });
};

/**
 * Process Azericard payment.
 */
const processAzericardPaymentController = async (req, res) => {
    winston.debug('paymentController.processAzericardPayment -- start');
    await processAzericardPayment(req.body);
    winston.debug('paymentController.processAzericardPayment -- success');
    return res.send();
};

/**
 * Process Yigim payment.
 */
const processYigimPaymentController = async (req, res) => {
    winston.debug('paymentController.processYigimPayment -- start');
    await processYigimPayment(req.query.reference);
    winston.debug('paymentController.processYigimPayment -- success');
    return res.send();
};

/**
 * Reverse payment.
 */
const reversePaymentController = async (req, res) => {
    winston.debug('paymentController.reversePayment -- start');
    await completePayment(req.params.orderId, true);
    winston.debug('paymentController.reversePayment -- success');
    return res.send();
};

module.exports = {
    approvePaymentController,
    getPaymentController,
    getPaymentDetailsController,
    getPaymentStatusController,
    processAzericardPaymentController,
    processYigimPaymentController,
    reversePaymentController,
};
