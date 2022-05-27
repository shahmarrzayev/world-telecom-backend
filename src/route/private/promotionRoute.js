const express = require('express');

const {
    addNewPromotionController,
    getAllPromotionsController,
    modifyPromotionController,
    removeManyPromotionsController,
} = require('../../controller/promotionController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/', role(UserRole.CONTENT_MANAGER), getAllPromotionsController);

router.post('/', role(UserRole.CONTENT_MANAGER), addNewPromotionController);
router.post('/delete', role(UserRole.CONTENT_MANAGER), removeManyPromotionsController);

router.put('/:id', role(UserRole.CONTENT_MANAGER), modifyPromotionController);

module.exports = router;
