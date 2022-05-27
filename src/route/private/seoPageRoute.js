const express = require('express');
const { UserRole } = require('../../enums');
const role = require('./../../middleware/roleMw');
const { createSeoPageController, modifySeoPageController, deleteSeoPageController, getAllSeoPagesController } = require('./../../controller/seoPageController');
const router = express.Router();

router.get('/all', role(UserRole.CONTENT_MANAGER) ,getAllSeoPagesController)

router.post('/', role(UserRole.CONTENT_MANAGER), createSeoPageController);
router.put('/:slug', role(UserRole.CONTENT_MANAGER), modifySeoPageController);
router.delete('/:slug', role(UserRole.CONTENT_MANAGER), deleteSeoPageController);


module.exports = router;