const express = require('express');

const { customerLoginController, loginController, refreshTokenController } = require('../../controller/authController');

const router = express.Router();

router.post('/login', loginController);
router.post('/sign-in', customerLoginController);
router.post('/refresh', refreshTokenController);

module.exports = router;
