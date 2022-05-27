const express = require('express');

const { addNewRoleController } = require('../../controller/roleController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.post('/', role(UserRole.SUPER_ADMIN), addNewRoleController);

module.exports = router;
