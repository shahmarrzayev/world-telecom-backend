const express = require('express');

const {
    changePasswordController,
    getCustomerOrdersController,
    modifyCustomerController,
    getCustomerInfoController
} = require('../../controller/customerController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/info', role(UserRole.CUSTOMER), getCustomerInfoController)
router.get('/orders', role(UserRole.CUSTOMER), getCustomerOrdersController);
router.post('/change-pass', role(UserRole.CUSTOMER), changePasswordController);
router.put('/', role(UserRole.CUSTOMER), modifyCustomerController);

module.exports = router;
