const express = require('express');

const { getAllNewsController, getNewsController } = require('../../controller/newsController');

const router = express.Router();

router.get('/', getAllNewsController);
router.get('/:id', getNewsController);

module.exports = router;
