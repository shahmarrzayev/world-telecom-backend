const express = require('express');

const {
    approveLoanRequestController,
    closeLoanRequestController,
    getLoanRequestByIdController,
    getManyLoanRequestsController,
} = require('../../controller/loanRequestController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');
const transaction = require('../../middleware/transactionMw');

const router = express.Router();

router.get('/', role(UserRole.ACCOUNTANT), getManyLoanRequestsController);
router.get('/:id', role(UserRole.ACCOUNTANT), transaction, getLoanRequestByIdController);

router.post('/:id', role(UserRole.ACCOUNTANT), approveLoanRequestController);

router.put('/:id', role(UserRole.ACCOUNTANT), closeLoanRequestController);

module.exports = router;
