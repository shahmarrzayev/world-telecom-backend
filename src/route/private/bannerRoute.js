const express = require('express');

const {
    addNewBannerController,
    getAllBannersController,
    modifyBannerController,
    removeBannerByIdController,
} = require('../../controller/bannerController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/', role(UserRole.CONTENT_MANAGER), getAllBannersController);

router.post('/', role(UserRole.CONTENT_MANAGER), addNewBannerController);
router.post('/delete/:id', role(UserRole.CONTENT_MANAGER), removeBannerByIdController);

router.put('/:id', role(UserRole.CONTENT_MANAGER), modifyBannerController);

module.exports = router;
