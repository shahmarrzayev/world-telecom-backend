const express = require('express');

const { createOrUpdateDeviceInfoController } = require('../../controller/deviceInfoController');

const router = express.Router();

router.post('/', createOrUpdateDeviceInfoController);

module.exports = router;
