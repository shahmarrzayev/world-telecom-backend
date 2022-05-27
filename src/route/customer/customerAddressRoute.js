const express = require('express');

const {
    addAddressController,
    deleteAddressController,
    updateAddressController,
} = require('../../controller/customerAddressController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.post('/', role(UserRole.CUSTOMER), addAddressController);
router.delete('/:addressId', role(UserRole.CUSTOMER), deleteAddressController);
router.put('/', role(UserRole.CUSTOMER), updateAddressController);

module.exports = router;
