const express = require('express');

const {
    addNewBranchController,
    getAllBranchesController,
    modifyBranchController,
    removeManyBranchesController,
} = require('../../controller/branchController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/', role(UserRole.CONTENT_MANAGER), getAllBranchesController);

router.post('/', role(UserRole.CONTENT_MANAGER), addNewBranchController);
router.post('/delete', role(UserRole.CONTENT_MANAGER), removeManyBranchesController);

router.put('/:id', role(UserRole.CONTENT_MANAGER), modifyBranchController);

module.exports = router;
