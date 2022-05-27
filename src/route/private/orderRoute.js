const express = require('express');

const {
    getCashPaidOrdersController,
    getOnlinePaidOrdersController,
    getOrderedNumbersController,
    modifyOrderController,
} = require('../../controller/orderController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/', role(UserRole.ACCOUNTANT), getCashPaidOrdersController);
router.get('/online', role(UserRole.SUPER_ADMIN), getOnlinePaidOrdersController);
router.get('/numbers', role(UserRole.NUMBER_PARTNER), getOrderedNumbersController);

router.put('/:id', role(UserRole.ACCOUNTANT), modifyOrderController);

module.exports = router;
