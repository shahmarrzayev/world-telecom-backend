const express = require('express');

const {
    getContentForAdminCreateProductController,
    getContentForAdminCreateProductOptionController,
    getContentForAdminProductsController,
} = require('../../controller/contentController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/create-product', role(UserRole.CONTENT_MANAGER), getContentForAdminCreateProductController);
router.get('/create-product-option', role(UserRole.CONTENT_MANAGER), getContentForAdminCreateProductOptionController);
router.get('/products', role(UserRole.CONTENT_MANAGER), getContentForAdminProductsController);

module.exports = router;
