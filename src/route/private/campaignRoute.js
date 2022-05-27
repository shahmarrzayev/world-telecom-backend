const express = require('express');

const {
    addNewCampaignController,
    getCampaignsController,
    modifyCampaignController,
    removeManyCampaignsController,
} = require('../../controller/campaignController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');
const transaction = require('../../middleware/transactionMw');

const router = express.Router();

router.get('/', role(UserRole.CONTENT_MANAGER), getCampaignsController);

router.post('/', role(UserRole.CONTENT_MANAGER), transaction, addNewCampaignController);
router.post('/delete', role(UserRole.CONTENT_MANAGER), transaction, removeManyCampaignsController);

router.put('/:id', role(UserRole.CONTENT_MANAGER), transaction, modifyCampaignController);

module.exports = router;
