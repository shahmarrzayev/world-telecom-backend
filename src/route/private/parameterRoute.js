const express = require('express');

const {
    addNewParameterController,
    getAllParametersController,
    modifyParameterController,
    removeManyParametersController,
} = require('../../controller/parameterController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');
const transaction = require('../../middleware/transactionMw');

const router = express.Router();

router.get('/', role(UserRole.CONTENT_MANAGER), getAllParametersController);

router.post('/', role(UserRole.CONTENT_MANAGER), transaction, addNewParameterController);
router.post('/delete', role(UserRole.CONTENT_MANAGER), transaction, removeManyParametersController);

router.put('/:id', role(UserRole.CONTENT_MANAGER), transaction, modifyParameterController);

module.exports = router;
