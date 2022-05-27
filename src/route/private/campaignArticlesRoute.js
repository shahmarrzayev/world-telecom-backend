const express = require('express');

const {
    addCampaignArticleController,
    getCampaignArticlesController,
    getCampaignArticleBySlugController,
    modifyCampaignArticleController,
    removeManyCampaignArticlesController,
} = require('../../controller/campaignArticleController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/', role(UserRole.CONTENT_MANAGER), getCampaignArticlesController);
router.get('/:slug', role(UserRole.CONTENT_MANAGER), getCampaignArticleBySlugController);

router.post('/', role(UserRole.CONTENT_MANAGER), addCampaignArticleController);
router.post('/delete', role(UserRole.CONTENT_MANAGER), removeManyCampaignArticlesController);

router.put('/:id', role(UserRole.CONTENT_MANAGER), modifyCampaignArticleController);

module.exports = router;
