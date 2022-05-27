const winston = require('winston');

// const { checkOrderCanBePaidOnline } = require('./helper/orderHelper');
const {
    generateAzericardCheckoutPSign,
    generateAzericardInitPSign,
    generateNonce,
    generateUnibankSignature,
    getAzericardInitData,
} = require('./helper/paymentHelper');
const { checkInstallmentPeriod } = require('./helper/productHelper');
const { checkoutAzericardPayment } = require('../client/azericardClient');
const {
    approvePashaBankTransaction,
    authorizePashaBankTransaction,
    getPashaBankTransactionResult,
    reversePashaBankTransaction,
} = require('../client/pashaBankClient');
const { getUnibankTransactionStatus } = require('../client/unibankClient');
const { cancelYigimPayment, getYigimPaymentStatus, initializeYigimPayment } = require('../client/yigimClient');
const { Env, OrderStatus, PaymentClient, PaymentStatus, PaymentType } = require('../enums');
const { GeneralException, NotFoundException } = require('../exceptions');
const { findOrderById, updateOrder } = require('../repository/orderRepository');
const {
    findPaymentByOrderAndNonce,
    findPaymentByOrderId,
    findPaymentByReference,
    savePayment,
    updatePayment,
} = require('../repository/paymentRepository');
const {
    createRandomNumber,
    createRandomString,
    delay,
    getCurrentTimestamp,
    getFromEnv,
} = require('../utils/commonUtils');

/**
 * @private
 * Complete Azericard sales.
 * @param {ObjectId} orderId
 * @returns {Promise}
 */
const completeAzericardPayment = async (orderEntity, paymentEntity, isReversal) => {
    winston.warn('paymentService.completeAzericardPayment -- start');
    if (!orderEntity || !paymentEntity || !paymentEntity.azericard || !paymentEntity.azericard.order) {
        winston.warn('paymentService.completeAzericardPayment -- null param');
        throw new GeneralException();
    }

    paymentEntity.azericard.completitionTimestamp = getCurrentTimestamp('YYYYMMDDHHMMSS');
    paymentEntity.azericard.completitionNonce = await generateNonce();
    if (!paymentEntity.azericard.completitionNonce) {
        winston.warn('paymentService.completeAzericardPayment -- error generating nonce');
        throw new GeneralException();
    }
    paymentEntity.azericard.completitionPSign = generateAzericardCheckoutPSign(paymentEntity, isReversal ? '24' : '21');
    if (!paymentEntity.azericard.completitionPSign) {
        winston.warn('paymentService.completeAzericardPayment -- could not generate pSign');
        throw new GeneralException('PSign yaradılmasında xəta');
    }

    const responseCode = await checkoutAzericardPayment({
        ORDER: paymentEntity.azericard.order,
        AMOUNT: paymentEntity.amount,
        CURRENCY: getFromEnv(Env.W_T_AZERICARD_CURRENCY),
        RRN: paymentEntity.azericard.rrn,
        INT_REF: paymentEntity.azericard.intRef,
        TRTYPE: isReversal ? '24' : '21',
        TERMINAL: getFromEnv(Env.W_T_AZERICARD_TERMINAL_ID),
        TIMESTAMP: paymentEntity.azericard.completitionTimestamp,
        NONCE: paymentEntity.azericard.completitionNonce,
        P_SIGN: paymentEntity.azericard.completitionPSign,
    });

    paymentEntity.responseCode = responseCode;
    if (responseCode === null || responseCode === 'undefined') paymentEntity.status = PaymentStatus.ERROR;
    else if (isReversal && responseCode === 0) paymentEntity.status = PaymentStatus.REVERTED;
    else if (responseCode === 0) paymentEntity.status = PaymentStatus.COMLETED;

    orderEntity.orderStatus = isReversal ? OrderStatus.CANCELED : OrderStatus.PENDING_PROCESSING;

    const [order, payment] = await Promise.all([
        updateOrder(orderEntity._id, orderEntity),
        updatePayment(paymentEntity._id, paymentEntity),
    ]);
    if (!order || !payment) {
        winston.warn('paymentService.completeAzericardPayment -- could not update payment');
        throw new GeneralException('Məlumatları yeniləyə bilmədim');
    }
    winston.warn('paymentService.completeAzericardPayment -- success');
    return payment.status !== PaymentStatus.ERROR;
};

/**
 * @private
 * Approves Pasha Bank payment (get the money).
 * @param {OrderEntity} orderEntity
 * @param {PaymentEntity} paymentEntity
 * @returns {Promise}
 */
const completePashaBankPayment = async (orderEntity, paymentEntity) => {
    winston.warn('paymentService.completePashaBankPayment -- start');
    if (!orderEntity || !paymentEntity) {
        winston.warn('paymentService.completePashaBankPayment -- null param');
        throw new GeneralException();
    }

    const approvalResult = await approvePashaBankTransaction(
        paymentEntity.reference,
        paymentEntity.amount * 100,
        paymentEntity.customerIp
    );
    if (!approvalResult) {
        winston.warn('paymentService.completePashaBankPayment -- could not approve payment');
        throw new GeneralException('Olmadı');
    }

    const transactionResult = await getPashaBankTransactionResult(paymentEntity.reference, paymentEntity.customerIp);
    if (!transactionResult) {
        winston.warn('paymentService.completePashaBankPayment -- could not retrieve transaction result');
        throw new GeneralException('Nəticə alına bilmədi');
    }

    paymentEntity.status = transactionResult.RESULT === 'OK' ? PaymentStatus.COMLETED : PaymentStatus.ERROR;
    paymentEntity.pashaBank.result = transactionResult.RESULT;
    paymentEntity.pashaBank.resultCode = transactionResult.RESULT_CODE;
    paymentEntity.pashaBank.rrn = transactionResult.RRN;
    paymentEntity.pashaBank.approvalCode = transactionResult.APPROVAL_CODE;
    paymentEntity.pashaBank.cardNumber = transactionResult.CARD_NUMBER;
    const savedPayment = await updatePayment(paymentEntity._id, paymentEntity);
    if (!savedPayment) {
        winston.warn('paymentService.completePashaBankPayment -- could not save payment');
        throw new GeneralException('Məlumatları yeniləyə bilmədim');
    }
    winston.warn('paymentService.completePashaBankPayment -- success');
    return savedPayment.status !== PaymentStatus.ERROR;
};

/**
 * @private
 * Get the result of Pasha Bank payment.
 * @param {ObjectId} orderId
 * @param {Transaction} transaction
 * @returns {Promise<PaymentStatus>}
 */
const getPashaBankPaymentStatus = async (orderEntity, paymentEntity) => {
    winston.warn(`paymentService.getPashaBankPaymentStatus -- start: ${orderEntity._id}`);
    if (!orderEntity || !paymentEntity) {
        winston.warn('paymentService.getPashaBankPaymentStatus -- null param');
        throw new GeneralException();
    }

    if (paymentEntity.pashaBank && paymentEntity.pashaBank.result) {
        winston.warn('paymentService.getPashaBankPaymentStatus -- status already fetched');
        return paymentEntity.status;
    }

    // Wait for 3 seconds since (it looks like) it takes some time at Pasha Bank to process the transaction.
    await delay(3000);

    const transactionResult = await getPashaBankTransactionResult(paymentEntity.reference, paymentEntity.customerIp);
    if (!transactionResult) {
        winston.warn('paymentService.getPashaBankPaymentStatus -- could not retrieve transaction result');
        throw new GeneralException();
    }

    paymentEntity.status = transactionResult.RESULT === 'OK' ? PaymentStatus.COMLETED : PaymentStatus.ERROR;
    orderEntity.orderStatus =
        transactionResult.RESULT === 'OK' ? OrderStatus.PENDING_PROCESSING : OrderStatus.PAYMENT_FAILED;

    paymentEntity.pashaBank.result = transactionResult.RESULT;
    paymentEntity.pashaBank.resultCode = transactionResult.RESULT_CODE;
    paymentEntity.pashaBank.rrn = transactionResult.RRN;
    paymentEntity.pashaBank.approvalCode = transactionResult.APPROVAL_CODE;
    paymentEntity.pashaBank.cardNumber = transactionResult.CARD_NUMBER;

    const [savedOrder, savedPayment] = await Promise.all([
        updateOrder(orderEntity._id, orderEntity),
        updatePayment(paymentEntity._id, paymentEntity),
    ]);
    if (!savedOrder || !savedPayment) {
        winston.warn('paymentService.getPashaBankPaymentStatus -- could not save order or payment');
        throw new GeneralException();
    }
    winston.warn('paymentService.getPashaBankPaymentStatus -- success');
    return savedPayment.status;
};

/**
 * @private
 * Gets Unibank payment status and updates entities.
 * @param {OrderEntity} orderEntity
 * @param {PaymentEntity} paymentEntity
 * @param {Transaction} transaction
 * @returns {Promise<PaymentStatus>}
 */
const getUnibankPaymentStatus = async (orderEntity, paymentEntity, transaction) => {
    winston.debug('paymentService.getUnibankPaymentStatus -- start');
    if (!orderEntity || !paymentEntity) {
        winston.warn('paymentService.getUnibankPaymentStatus -- null param');
        throw new GeneralException();
    }

    const paymentStatus = await getUnibankTransactionStatus(paymentEntity.reference);
    if (!paymentStatus) {
        winston.warn('paymentService.getUnibankPaymentStatus -- could not get status');
        throw new GeneralException();
    }

    if (paymentStatus.code === '0') {
        orderEntity.orderStatus = OrderStatus.PENDING_PROCESSING;
        paymentEntity.status = PaymentStatus.SUCCESS;
    } else if (paymentStatus.code !== '2' && paymentStatus.code !== '3') {
        orderEntity.orderStatus = OrderStatus.PAYMENT_FAILED;
        paymentEntity.status = PaymentStatus.ERROR;
    }

    paymentEntity.unibank.code = paymentStatus.code;
    paymentEntity.unibank.rrn = paymentStatus.rrn;
    paymentEntity.unibank.xid = paymentStatus.xid;

    const [order, payment] = await Promise.all([
        updateOrder(orderEntity._id, orderEntity, transaction),
        updatePayment(paymentEntity._id, paymentEntity, transaction),
    ]);
    if (!order || !payment) {
        winston.warn('paymentService.getUnibankPaymentStatus -- could not update');
        throw new GeneralException();
    }
    winston.debug('paymentService.getUnibankPaymentStatus -- success');
    return payment.status;
};

/**
 * @private
 * Reverse previously authorized Pasha Bank payment.
 * @param {OrderEntity} orderEntity
 * @param {PaymentEntity} paymentEntity
 * @returns {Promise}
 */
const reversePashaBankPayment = async (orderEntity, paymentEntity) => {
    winston.debug('paymentService.reversePashaBankPayment -- start');
    if (!orderEntity || !paymentEntity) {
        winston.warn('paymentService.reversePashaBankPayment -- null param');
        throw new GeneralException();
    }

    const result = await reversePashaBankTransaction(paymentEntity.reference, paymentEntity.amount * 100);
    if (!result) {
        winston.warn('paymentService.reversePashaBankPayment -- could not reverse payment');
        throw new GeneralException('Xəta');
    }

    orderEntity.orderStatus = OrderStatus.CANCELED;
    paymentEntity.status = result.RESULT === 'OK' ? PaymentStatus.REVERTED : PaymentStatus.ERROR;
    const [order, payment] = await Promise.all([
        updateOrder(orderEntity._id, orderEntity),
        updatePayment(paymentEntity._id, paymentEntity),
    ]);
    if (!order || !payment) {
        winston.warn('paymentService.reversePashaBankPayment -- could not save payment or order');
        throw new GeneralException('Məlumatları yeniləyə bilmədim');
    }
    winston.debug('paymentService.reversePashaBankPayment -- success');
    return payment.status !== PaymentStatus.ERROR;
};

/**
 * @private
 * Reverts payment made with Yigim.
 * @param {ObjectId} orderId
 * @returns {Promise}
 */
const revertYigimPayment = async (orderEntity, paymentEntity) => {
    winston.debug('paymentService.revertYigimPayment -- start');
    if (!orderEntity || !paymentEntity) {
        winston.warn('paymentService.revertYigimPayment -- null param');
        throw new GeneralException();
    }

    const { code, message } = (await cancelYigimPayment(paymentEntity.reference)) || {};
    if (code !== 0 || !message) {
        winston.warn('paymentService.revertYigimPayment -- could not cancel payment');
        throw new GeneralException('Alınmadı');
    }

    orderEntity.orderStatus = OrderStatus.CANCELED;
    paymentEntity.responseCode = code;
    paymentEntity.responeMessage = message;
    paymentEntity.status = PaymentStatus.REVERTED;

    const [order, payment] = await Promise.all([
        updateOrder(orderEntity._id, orderEntity),
        updatePayment(paymentEntity._id, paymentEntity),
    ]);
    if (!order || !payment) {
        winston.warn('paymentService.revertYigimPayment -- could not save');
        throw new GeneralException();
    }
    winston.debug('paymentService.revertYigimPayment -- success');
};

/**
 * Completes payment (approve or reject).
 * @param {ObjectId} orderId
 * @param {Boolean} isReversal
 * @returns {Promise<Object>}
 */
const completePayment = async (orderId, isReversal) => {
    winston.warn('paymentService.completePayment -- start');
    if (!orderId) {
        winston.warn('paymentService.completePayment -- null param');
        throw new GeneralException();
    }

    const [order, payment] = await Promise.all([findOrderById(orderId), findPaymentByOrderId(orderId)]);
    if (!order || !payment) {
        winston.warn(`paymentService.completePayment -- not found: ${order}, ${payment}`);
        throw new NotFoundException('Ödəniş tapılmadı');
    }

    let transactionResult;
    if (order.paymentType === PaymentType.ONLINE && payment.client === PaymentClient.YIGIM && isReversal) {
        await revertYigimPayment(order, payment);
    } else if (order.paymentType === PaymentType.ONLINE_AZERICARD && payment.client === PaymentClient.AZERICARD) {
        transactionResult = await completeAzericardPayment(order, payment, isReversal);
    } else if (order.paymentType === PaymentType.ONLINE_PASHA_BANK && payment.client === PaymentClient.PASHA_BANK) {
        transactionResult = isReversal
            ? await reversePashaBankPayment(order, payment)
            : await completePashaBankPayment(order, payment);
    } else {
        winston.warn(`paymentService.completePayment -- uknown case: ${order.paymentType}, ${payment.client}`);
        throw new GeneralException('UniBank ödənişləri geri qaytarılmır');
    }
    winston.warn('paymentService.completePayment -- success');
    return { result: transactionResult };
};

/**
 * Initializes new Azericard payment.
 * @param {OrderEntity} orderEntity
 * @param {Transaction} transaction
 * @returns {Promise}
 */
const createNewAzericardPayment = async (orderEntity, transaction) => {
    winston.debug('paymentService.createNewAzericardPayment -- start');
    if (!orderEntity) {
        winston.warn('paymentService.createNewAzericardPayment -- null param');
        throw new GeneralException();
    }

    const azericardOrder = createRandomNumber(10000000000, 100000000000).toString();
    const nonce = await generateNonce();
    if (!nonce) {
        winston.warn('paymentService.createNewAzericardPayment -- could not generate nonce');
        throw new GeneralException();
    }

    const payment = {
        reference: azericardOrder,
        orderId: orderEntity._id,
        client: PaymentClient.AZERICARD,
        amount: orderEntity.totalPrice,
        currency: getFromEnv(Env.W_T_AZERICARD_CURRENCY),
        status: PaymentStatus.PENDING,
        azericard: {
            order: azericardOrder,
            nonce,
            lastTransactionType: '0',
            timestamp: getCurrentTimestamp('YYYYMMDDHHMMSS'),
        },
    };
    const pSign = generateAzericardInitPSign(payment, '0');
    if (!pSign) {
        winston.warn('paymentService.createNewAzericardPayment -- could not generate pSign');
        throw new GeneralException();
    }
    payment.azericard.pSign = pSign;

    const savedPayment = await savePayment(payment, transaction);
    if (!savedPayment) {
        winston.warn('paymentService.createNewPashaBankPayment -- could not save payment');
        throw new GeneralException();
    }
    winston.debug('paymentService.createNewAzericardPayment -- success');
};

/**
 * Initializes new Pasha Bank payment.
 * @param {OrderEntity} orderEntity
 * @param {String} clientIp
 * @param {Transaction} transaction
 * @returns {Promise<String>} url
 */
const createNewPashaBankPayment = async (orderEntity, clientIp, transaction) => {
    winston.warn('paymentService.createNewPashaBankPayment -- start');
    if (!orderEntity || !orderEntity._id || !orderEntity.totalPrice || !clientIp) {
        winston.warn('paymentService.createNewPashaBankPayment -- null param');
        throw new GeneralException();
    }

    if (orderEntity.installmentPeriod) {
        const result = await checkInstallmentPeriod(orderEntity.orderedProductOptions, orderEntity.installmentPeriod);
        if (!result) {
            winston.warn('paymentService.createNewPashaBankPayment -- wrong installment period');
            throw new GeneralException();
        }
    }

    const transactionId = await authorizePashaBankTransaction(
        orderEntity.totalPrice * 100,
        clientIp,
        orderEntity.installmentPeriod
    );
    if (!transactionId) {
        winston.warn('paymentService.createNewPashaBankPayment -- could not authorize payment');
        throw new GeneralException();
    }

    const payment = {
        reference: transactionId,
        orderId: orderEntity._id,
        client: PaymentClient.PASHA_BANK,
        amount: orderEntity.totalPrice,
        currency: 'AZN',
        status: PaymentStatus.PENDING,
        customerIp: clientIp,
        url: `${getFromEnv(Env.W_T_PASHA_BANK_CLIENT_URL)}?trans_id=${transactionId}`,
        installmentPeriod: orderEntity.installmentPeriod,
    };
    const savedPayment = await savePayment(payment, transaction);
    if (!savedPayment) {
        winston.warn('paymentService.createNewPashaBankPayment -- could not save payment');
        throw new GeneralException();
    }
    winston.warn('paymentService.createNewPashaBankPayment -- success');
    return savedPayment.url;
};

/**
 * Creates new Unibank payment.
 * @param {OrderEntity} orderEntity
 * @param {Transaction} transaction
 * @returns {Promise<String>} url
 */
const createNewUnibankPayment = async (orderEntity, transaction) => {
    winston.debug('paymentService.createNewUnibankPayment -- start');
    if (!orderEntity || !orderEntity._id || !orderEntity.totalPrice) {
        winston.warn('paymentService.createNewUnibankPayment -- null param');
        throw new GeneralException();
    }

    const reference = createRandomString(8);
    const description = `Wolrd telecom: ${orderEntity.totalPrice}`;
    const signature = await generateUnibankSignature(reference, orderEntity.totalPrice * 100, description);
    if (!signature) {
        winston.warn('paymentService.createNewUnibankPayment -- could not generate signature');
        throw new GeneralException();
    }

    let url = `${getFromEnv(Env.W_T_UNIBANK_URL)}/register`;
    url = `${url}?mid=${getFromEnv(Env.W_T_UNIBANK_MID)}`;
    url = `${url}&amount=${orderEntity.totalPrice * 100}`;
    url = `${url}&currency=944`;
    url = `${url}&description=${description}`;
    url = `${url}&reference=${reference}`;
    url = `${url}&language=az`;
    url = `${url}&signature=${signature}`;
    url = `${url}&redirect=1`;

    const payment = {
        reference,
        orderId: orderEntity._id,
        client: PaymentClient.UNIBANK,
        amount: orderEntity.totalPrice,
        currency: '944',
        status: PaymentStatus.PENDING,
        url,
    };
    const savedPayment = await savePayment(payment, transaction);
    if (!savedPayment) {
        winston.warn('paymentService.createNewUnibankPayment -- could not save payment');
        throw new GeneralException();
    }
    winston.debug('paymentService.createNewUnibankPayment -- success');
    return savedPayment.url;
};

/**
 * Initializes payment and creates db entity.
 * @param {OrderEntity} orderEntity
 * @param {Transaction} transaction
 * @returns {Promise<String>} url
 */
const createNewYigimPayment = async (orderEntity, transaction) => {
    winston.debug('paymentService.createNewYigimPayment -- start');
    if (!orderEntity || !orderEntity._id || !orderEntity.totalPrice) {
        winston.warn('paymentService.createNewYigimPayment -- null param');
        throw new GeneralException();
    }

    // if (!checkOrderCanBePaidOnline(orderEntity.orderedProductOptions, orderEntity.orderedNumbers)) {
    //     winston.warn('paymentService.createNewYigimPayment -- yigim payment not enabled');
    //     throw new GeneralException();
    // }

    const reference = createRandomNumber();
    const { code, message, url } = (await initializeYigimPayment(reference, orderEntity.totalPrice * 100)) || {};
    if (code !== 0 || !url) {
        winston.error(`paymentService.createNewYigimPayment -- could not init payment: ${code}, ${message}, ${url}`);
        throw new GeneralException();
    }

    const payment = {
        reference,
        orderId: orderEntity._id,
        client: PaymentClient.YIGIM,
        amount: orderEntity.totalPrice,
        currency: getFromEnv(Env.W_T_PAYMENT_CURRENCY),
        status: PaymentStatus.PENDING,
        responseCode: code,
        responseMessage: message,
        url,
    };

    const paymentEntity = await savePayment(payment, transaction);
    if (!paymentEntity) {
        winston.warn('paymentService.createNewYigimPayment -- could not save payment');
        throw new GeneralException();
    }
    winston.debug('paymentService.createNewYigimPayment -- success');
    return url;
};

/**
 * Get payment.
 * @param {ObjectId} orderId
 * @returns {Promise<PaymentEntity>}
 */
const getPayment = async orderId => {
    winston.debug('paymentService.getPayment -- start');
    if (!orderId) {
        winston.warn('paymentService.getPayment -- null param');
        throw new GeneralException();
    }

    const payment = await findPaymentByOrderId(orderId);
    if (!payment) {
        winston.debug('paymentService.getPayment -- not found');
        throw new GeneralException();
    }
    winston.debug('paymentService.getPayment -- success');
    return payment;
};

/**
 * Get payment url by order id.
 * @param {ObjectId} orderId
 * @returns {Promise<Object>}
 */
const getPaymentDetails = async orderId => {
    winston.debug('paymentService.getPaymentDetails -- start');
    if (!orderId) {
        winston.warn('paymentService.getPaymentDetails -- null param');
        throw new GeneralException();
    }

    const [orderEntity, paymentEntity] = await Promise.all([findOrderById(orderId), findPaymentByOrderId(orderId)]);
    if (!orderEntity || !paymentEntity || paymentEntity.status !== PaymentStatus.PENDING) {
        winston.warn('paymentService.getPaymentDetails -- payment not found');
        throw new NotFoundException();
    }

    let azericardInitData;
    if (paymentEntity.client === PaymentClient.AZERICARD) {
        azericardInitData = getAzericardInitData(paymentEntity);
    }

    winston.debug('paymentService.getPaymentDetails -- success');
    return {
        azericardInitData,
        orderInfo: orderEntity,
        url: paymentEntity.url,
    };
};

/**
 * Get payment status.
 * @param {ObjectId} orderId
 * @returns {Promise<PaymentStatus>}
 */
const getPaymentStatus = async orderId => {
    winston.debug('paymentService.getPaymentStatus -- start');
    if (!orderId) {
        winston.warn('paymentService.getPaymentStatus -- null param');
        throw new GeneralException();
    }

    const [order, payment] = await Promise.all([findOrderById(orderId), findPaymentByOrderId(orderId)]);
    if (!order || !payment) {
        winston.warn('paymentService.getPaymentStatus -- could not find order or payment');
        throw new NotFoundException();
    }

    let { status } = payment;
    if (payment.client === PaymentClient.PASHA_BANK) {
        status = await getPashaBankPaymentStatus(order, payment);
    } else if (payment.client === PaymentClient.UNIBANK) {
        status = await getUnibankPaymentStatus(order, payment);
    }
    winston.debug('paymentService.getPaymentStatus -- success');
    return { order, status };
};

/**
 * Process Azericard payment.
 * @param {AzericardClientView} azericardClientView
 * @param {Transaction} transaction
 * @returns {Promise}
 */
const processAzericardPayment = async (azericardClientView, transaction) => {
    winston.debug('paymentService.processAzericardPayment -- start');
    if (!azericardClientView) {
        winston.warn('paymentService.processAzericardPayment -- null param');
        throw new GeneralException();
    }

    const paymentEntity = await findPaymentByOrderAndNonce(
        azericardClientView.ORDER,
        azericardClientView.NONCE,
        transaction
    );
    if (!paymentEntity || paymentEntity.status !== PaymentStatus.PENDING) {
        winston.warn('paymentService.processAzericardPayment -- payment not found');
        throw new NotFoundException();
    }

    const orderEntity = await findOrderById(paymentEntity.orderId);
    if (!orderEntity || orderEntity.orderStatus !== OrderStatus.PENDING_PAYMENT) {
        winston.warn('paymentService.processAzericardPayment -- order not found');
        throw new NotFoundException();
    }

    paymentEntity.azericard.action = azericardClientView.ACTION;
    paymentEntity.azericard.rrn = azericardClientView.RRN;
    paymentEntity.azericard.intRef = azericardClientView.INT_REF;

    if (azericardClientView.INT_REF) {
        paymentEntity.status = PaymentStatus.SUCCESS;
        orderEntity.orderStatus = OrderStatus.PENDING_PROCESSING;
    } else {
        winston.warn(`paymentService.processPayment -- payment failed: ${JSON.stringify(azericardClientView)}`);
        paymentEntity.status = PaymentStatus.ERROR;
        orderEntity.orderStatus = OrderStatus.PAYMENT_FAILED;
    }

    await Promise.all([
        updatePayment(paymentEntity._id, paymentEntity, transaction),
        updateOrder(orderEntity._id, orderEntity, transaction),
    ]);
    winston.debug('paymentService.processAzericardPayment -- start');
};

/**
 * Callback method for Yigim client.
 * @param {String} reference
 * @returns {Promise}
 */
const processYigimPayment = async reference => {
    winston.debug('paymentService.processYigimPayment -- start');
    if (!reference) {
        winston.warn('paymentService.processYigimPayment -- null param');
        throw new GeneralException();
    }

    const paymentEntity = await findPaymentByReference(reference);
    if (!paymentEntity) {
        winston.warn(`paymentService.processYigimPayment -- could not find payment: ${reference}`);
        throw new NotFoundException();
    }

    const [orderEntity, paymentStatus] = await Promise.all([
        findOrderById(paymentEntity.orderId),
        getYigimPaymentStatus(reference),
    ]);
    if (!orderEntity || !paymentStatus) {
        winston.warn(`paymentService.processYigimPayment -- not found: ${orderEntity}, ${paymentStatus}`);
        throw new NotFoundException();
    }

    winston.warn(`paymentService.processYigimPayment -- PAYMENT STATUS: ${paymentStatus}`);
    const paymentWasSuccessful = paymentStatus.status && paymentStatus.status === '00';
    orderEntity.orderStatus = paymentWasSuccessful ? OrderStatus.PENDING_PROCESSING : OrderStatus.PAYMENT_FAILED;
    paymentEntity.status = paymentWasSuccessful ? PaymentStatus.SUCCESS : PaymentStatus.ERROR;
    paymentEntity.responseCode = paymentStatus.code;
    paymentEntity.responeMessage = paymentStatus.message;

    await Promise.all([updateOrder(orderEntity._id, orderEntity), updatePayment(paymentEntity._id, paymentEntity)]);
    winston.debug('paymentService.processYigimPayment -- success');
};

/**
 * Returns Yigim payment information.
 * @param {ObjectId} orderId
 * @returns {Promise<PaymentStatusView>}
 */
const retrieveYigimPaymentStatus = async orderId => {
    winston.debug('paymentService.retrieveYigimPaymentStatus -- start');
    if (!orderId) {
        winston.warn('paymentService.retrieveYigimPaymentStatus -- null param');
        throw new GeneralException();
    }

    const paymentEntity = await findPaymentByOrderId(orderId);
    if (!paymentEntity) {
        winston.warn('paymentService.retrieveYigimPaymentStatus -- could not find payment');
        throw new NotFoundException();
    }

    const paymentStatus = await getYigimPaymentStatus(paymentEntity.reference);
    if (!paymentStatus) {
        winston.warn('paymentService.retrieveYigimPaymentStatus -- could not retrieve payment status');
        throw new NotFoundException();
    }
    winston.debug('paymentService.retrieveYigimPaymentStatus -- success');
    return paymentStatus;
};

module.exports = {
    completePayment,
    createNewAzericardPayment,
    createNewPashaBankPayment,
    createNewUnibankPayment,
    createNewYigimPayment,
    getPayment,
    getPaymentDetails,
    getPaymentStatus,
    processAzericardPayment,
    processYigimPayment,
    retrieveYigimPaymentStatus,
    revertYigimPayment,
};
