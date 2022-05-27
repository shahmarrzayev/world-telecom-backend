const express = require('express');

const router = express.Router();

const {
  getOneSettingController,
  getAllSettingsController,
  createSettingController,
  modifySettingController,
  deleteOneSettingController
} = require('../../controller/settingController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

router.get('/:id', role(UserRole.ADMIN) ,getOneSettingController);
router.get('/', role(UserRole.ADMIN), getAllSettingsController);

router.post('/', role(UserRole.ADMIN), createSettingController);

router.put('/:id', role(UserRole.ADMIN), modifySettingController);

router.delete('/:id', role(UserRole.ADMIN), deleteOneSettingController);


module.exports = router;