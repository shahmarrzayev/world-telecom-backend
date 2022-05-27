const express = require('express');

const {
    addNewLoanController,
    getAllLoansController,
    modifyLoanController,
    removeManyLoansController,
} = require('../../controller/loanController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');
const transaction = require('../../middleware/transactionMw');

const router = express.Router();

router.get('/', role(UserRole.CONTENT_MANAGER), getAllLoansController);

router.post('/', role(UserRole.CONTENT_MANAGER), transaction, addNewLoanController);
router.post('/delete', role(UserRole.CONTENT_MANAGER), transaction, removeManyLoansController);

router.put('/:id', role(UserRole.CONTENT_MANAGER), transaction, modifyLoanController);

module.exports = router;
