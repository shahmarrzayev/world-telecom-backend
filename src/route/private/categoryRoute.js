const express = require('express');

const {
    addNewCategoryController,
    getAllCategoriesController,
    getCategoryDetailedInfoController,
    modifyCategoryController,
    removeCategoriesController,
} = require('../../controller/categoryController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');
const transaction = require('../../middleware/transactionMw');

const router = express.Router();

router.get('/', role(UserRole.CONTENT_MANAGER), getAllCategoriesController);
router.get('/:slug', role(UserRole.CONTENT_MANAGER), getCategoryDetailedInfoController);

router.post('/', role(UserRole.CONTENT_MANAGER), addNewCategoryController);
router.post('/remove', role(UserRole.CONTENT_MANAGER), transaction, removeCategoriesController);

router.put('/:id', role(UserRole.CONTENT_MANAGER), modifyCategoryController);

module.exports = router;
