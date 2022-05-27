const express = require('express');

const { addUserController, getUserByIdController } = require('../../controller/userController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/:id', role(UserRole.SUPER_ADMIN), getUserByIdController);
router.post('/', role(UserRole.SUPER_ADMIN), addUserController);

module.exports = router;
