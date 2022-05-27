const express = require('express');

const {
    getContentForHomePageController,
    getContentForProductsPageController,
    getWebsiteContentController,
} = require('../../controller/contentController');

const router = express.Router();

router.get('/home-page', getContentForHomePageController);
router.get('/products', getContentForProductsPageController);
router.get('/website', getWebsiteContentController);

module.exports = router;
