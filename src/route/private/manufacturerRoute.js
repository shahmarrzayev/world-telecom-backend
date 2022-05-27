const express = require('express');

const {
    addNewManufacturerController,
    getAllManufacturersController,
    modifyManufacturerController,
    removeManyManufacturersController,
} = require('../../controller/manufacturerController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');
const transaction = require('../../middleware/transactionMw');

const router = express.Router();

router.get('/', role(UserRole.CONTENT_MANAGER), getAllManufacturersController);

router.post('/', role(UserRole.CONTENT_MANAGER), addNewManufacturerController);
router.post('/remove', role(UserRole.CONTENT_MANAGER), removeManyManufacturersController);

router.patch('/:id', role(UserRole.CONTENT_MANAGER), transaction, modifyManufacturerController);

module.exports = router;
