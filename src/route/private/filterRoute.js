const express = require('express');
const { addNewFiltersController, activateFiltersController, deactivateFiltersController } = require('../../controller/filterController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');
const router = express.Router();

router.post('/', role(UserRole.CONTENT_MANAGER), addNewFiltersController);
router.post('/activate', role(UserRole.CONTENT_MANAGER), activateFiltersController);
router.post('/deactivate', role(UserRole.CONTENT_MANAGER), deactivateFiltersController);

module.exports = router;