const express = require('express');

const { addNewLoanRequestController, getLoanRequestByIdController } = require('../../controller/loanRequestController');
const transaction = require('../../middleware/transactionMw');

const router = express.Router();

router.post('/', transaction, addNewLoanRequestController);
router.get('/:id', getLoanRequestByIdController);

module.exports = router;
