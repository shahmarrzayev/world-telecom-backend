const express = require('express');

const { registerCustomerController } = require('../../controller/customerController');

const router = express.Router();

router.post('/signup', registerCustomerController);

module.exports = router;
