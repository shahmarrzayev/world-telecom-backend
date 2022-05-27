const express = require('express');

const { getUserActivitiesController } = require('../../controller/userActivityController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/', role(UserRole.ADMIN), getUserActivitiesController);

module.exports = router;
