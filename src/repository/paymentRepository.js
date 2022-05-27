const { ObjectId } = require('mongoose').Types;
const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const Payment = require('./models/paymentModel');

const findPaymentByOrderAndNonce = async (order, nonce, transaction) => {
    winston.debug('paymentRepository.findPaymentByOrderAndNonce -- start');
    if (!order || !nonce) {
        winston.warn('paymentRepository.findPaymentByOrderAndNonce -- null param');
        return null;
    }
    const payment = await runQuery(() =>
        Payment.findOne({ 'azericard.order': order, 'azericard.nonce': nonce }).session(transaction)
    );
    winston.debug('paymentRepository.findPaymentByOrderAndNonce -- success');
    return payment;
};

const findPaymentByOrderId = async (id, transaction) => {
    winston.debug('paymentRepository.findPaymentByOrderId -- start');
    if (!id) {
        winston.warn('paymentRepository.findPaymentByOrderId -- both params are null');
        return null;
    }
    const payment = await runQuery(() => Payment.findOne({ orderId: ObjectId(id) }).session(transaction));
    winston.debug('paymentRepository.findPaymentByOrderId -- success');
    return payment;
};

const findPaymentByReference = async (reference, transaction) => {
    winston.debug('paymentRepository.findPaymentByReference -- start');
    if (!reference) {
        winston.warn('paymentRepository.findPaymentByReference -- null param');
        return null;
    }

    const payment = await runQuery(() => Payment.findOne({ reference }).session(transaction));
    winston.debug('paymentRepository.findPaymentByReference -- success');
    return payment;
};

const findPaymentByReferenceAndOrderId = async (reference, orderId, transaction) => {
    winston.debug('paymentRepository.findPaymentByReferenceAndOrderId -- start');
    if (!reference || !orderId) {
        winston.warn('paymentRepository.findPaymentByReferenceAndOrderId -- null param');
        return null;
    }

    const payment = await runQuery(() => Payment.findOne({ $and: [{ reference }, { orderId }] }).session(transaction));
    winston.debug('paymentRepository.findPaymentByReferenceAndOrderId -- success');
    return payment;
};

const savePayment = async (payment, transaction) => {
    winston.debug('paymentRepository.savePayment -- start');
    if (!payment) {
        winston.warn('paymentRepository.savePayment -- null param');
        return null;
    }
    const dbPayment = new Payment(payment);
    const savedPaymentEntity = await runQuery(() => dbPayment.save({ session: transaction }));
    winston.debug('paymentRepository.savePayment -- start');
    return savedPaymentEntity;
};

const updatePayment = async (id, payment, transaction) => {
    winston.info('paymentRepository.updatePayment -- start');
    if (!id || !payment) {
        winston.warn(`paymentRepository.updatePayment -- null param: ${id}, ${payment}`);
        return null;
    }
    const updatedPayment = await runQuery(() =>
        Payment.findByIdAndUpdate(id, payment, {
            new: true,
            session: transaction,
            useFindAndModify: false,
        })
    );
    winston.info('paymentRepository.updatePayment -- success');
    return updatedPayment;
};

module.exports = {
    findPaymentByOrderAndNonce,
    findPaymentByOrderId,
    findPaymentByReference,
    findPaymentByReferenceAndOrderId,
    savePayment,
    updatePayment,
};
