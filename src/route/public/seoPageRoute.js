const express = require('express');
const { getSeoPageController } = require('./../../controller/seoPageController');
const router = express.Router();


router.get('/:slug', getSeoPageController);



module.exports = router;