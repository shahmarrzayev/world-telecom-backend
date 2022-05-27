const express = require('express');

const {
    addNumberController,
    deleteNumbersByIdsController,
    getManyNumbersController,
    modifyNumberController,
} = require('../../controller/numberController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/', role(UserRole.NUMBER_PARTNER), getManyNumbersController);

router.post('/', role(UserRole.NUMBER_PARTNER), addNumberController);
router.post('/delete', role(UserRole.NUMBER_PARTNER), deleteNumbersByIdsController);

router.put('/:id', role(UserRole.NUMBER_PARTNER), modifyNumberController);

module.exports = router;
