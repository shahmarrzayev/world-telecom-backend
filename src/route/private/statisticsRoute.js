const express = require('express');

const {
    getStatisticsController,
    getStatsForSingleProductController,
} = require('../../controller/statisticsController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/', role(UserRole.ADMIN), getStatisticsController);
router.get('/for', role(UserRole.ADMIN), getStatsForSingleProductController);

module.exports = router;
