const express = require('express');

const {
    approvePaymentController,
    getPaymentController,
    reversePaymentController,
} = require('../../controller/paymentController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/:orderId', role(UserRole.SUPER_ADMIN), getPaymentController);

router.post('/approve/:orderId', role(UserRole.SUPER_ADMIN), approvePaymentController);
router.post('/reverse/:orderId', role(UserRole.SUPER_ADMIN), reversePaymentController);

module.exports = router;
