const express = require('express');

const {
    getManyProductsController,
    getProductByIdPublicController,
    getProductOptionByIdController,
} = require('../../controller/productController');

const router = express.Router();

router.get('/', getManyProductsController);
router.get('/:id', getProductByIdPublicController);
router.get(':id/options/:optionId', getProductOptionByIdController);


module.exports = router;
