const express = require('express');

const { getOrderByIdController, registerOrderController } = require('../../controller/orderController');
const transaction = require('../../middleware/transactionMw');

const router = express.Router();

router.get('/:id', getOrderByIdController);
router.post('/register', transaction, registerOrderController);

module.exports = router;
