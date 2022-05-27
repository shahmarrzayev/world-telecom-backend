const express = require('express');

const { getManyNumbersController, getManyNumbersByIdsController } = require('../../controller/numberController');

const router = express.Router();

router.get('/', getManyNumbersController);
router.get('/ids', getManyNumbersByIdsController);

module.exports = router;
