const express = require('express');

const {
    getCampaignArticlesController,
    getCampaignArticleBySlugController,
} = require('../../controller/campaignArticleController');

const router = express.Router();

router.get('/', getCampaignArticlesController);
router.get('/:slug', getCampaignArticleBySlugController);

module.exports = router;
