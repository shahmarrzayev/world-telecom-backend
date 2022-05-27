const express = require('express');

const {
    getPaymentDetailsController,
    getPaymentStatusController,
    processAzericardPaymentController,
    processYigimPaymentController,
} = require('../../controller/paymentController');

const router = express.Router();

router.get('/', processYigimPaymentController);
router.get('/:orderId', getPaymentDetailsController);
router.post('/status/:orderId', getPaymentStatusController);
router.post('/process', processAzericardPaymentController);

module.exports = router;
