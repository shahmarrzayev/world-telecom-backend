const express = require('express');
const { getFiltersController } = require('../../controller/filterController');

const router = express.Router();

router.get('/:slug', getFiltersController);

module.exports = router;