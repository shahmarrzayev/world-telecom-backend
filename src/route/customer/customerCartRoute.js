const express = require('express');

const {
    addNumberToCartController,
    addOptionToCartController,
    checkoutCustomerCartController,
    clearCartController,
    getCustomerCartController,
    removeItemFromCartController,
    clearItemFromCartController
} = require('../../controller/customerCartController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');
const transaction = require('../../middleware/transactionMw');

const router = express.Router();

router.get('/', role(UserRole.CUSTOMER), getCustomerCartController);

router.post('/checkout/:paymentType', role(UserRole.CUSTOMER), transaction, checkoutCustomerCartController);
router.post('/product/:optionId', role(UserRole.CUSTOMER), addOptionToCartController);
router.post('/number/:numberId', role(UserRole.CUSTOMER), addNumberToCartController);

router.delete('/product/:optionId', role(UserRole.CUSTOMER), clearItemFromCartController);

router.delete('/all', role(UserRole.CUSTOMER), clearCartController);
router.delete('/:optionId', role(UserRole.CUSTOMER), removeItemFromCartController);


module.exports = router;
