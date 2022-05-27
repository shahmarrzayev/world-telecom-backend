const express = require('express');

const { getAllBranchesController } = require('../../controller/branchController');

const router = express.Router();

router.get('/', getAllBranchesController);

module.exports = router;
