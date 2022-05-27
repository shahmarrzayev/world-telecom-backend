const express = require('express');
const {
    addNewProductController,
    addNewProductOptionController,
    addToPopularProductsController,
    getAllPopularProductsController,
    getProductByIdController,
    getProductOptionByProductIdAndIdController,
    getManyProductsPrivateController,
    getProductOptionBySlugController,
    modifyProductController,
    modifyProductOptionController,
    modifyProductOptionsPricesByMemoryController,
    removeManyProductsController,
    modifyAllProductPriceByOptionPricesController,
} = require('../../controller/productController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');
const transaction = require('../../middleware/transactionMw');

const router = express.Router();

router.get('/', role(UserRole.CONTENT_MANAGER), getManyProductsPrivateController);
router.get('/:id', role(UserRole.CONTENT_MANAGER), getProductByIdController);
router.get('/:id/options/:optionId', role(UserRole.CONTENT_MANAGER), getProductOptionByProductIdAndIdController);
router.get('/option/:slug', role(UserRole.CONTENT_MANAGER), getProductOptionBySlugController);

router.post('/', role(UserRole.CONTENT_MANAGER), addNewProductController);
router.post('/delete', role(UserRole.CONTENT_MANAGER), transaction, removeManyProductsController);
router.post('/popular', role(UserRole.CONTENT_MANAGER), getAllPopularProductsController);
router.post('/:id/options', role(UserRole.CONTENT_MANAGER), transaction, addNewProductOptionController);
router.post('/:id/make-popular/:order', role(UserRole.CONTENT_MANAGER), transaction, addToPopularProductsController);

router.put('/modify-by-option-price', role(UserRole.CONTENT_MANAGER), modifyAllProductPriceByOptionPricesController);
router.put('/:id', role(UserRole.CONTENT_MANAGER), transaction, modifyProductController);
router.put('/:id/options/:optionId', role(UserRole.CONTENT_MANAGER), transaction, modifyProductOptionController);
router.put('/:id/modify-by-memory', role(UserRole.CONTENT_MANAGER), transaction, modifyProductOptionsPricesByMemoryController);

module.exports = router;
