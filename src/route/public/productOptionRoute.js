const express = require('express');

const {
    getManyProductOptionsByIdsController,
    getProductOptionByIdController
} = require('../../controller/productController');

const router = express.Router();

router.get('/', getManyProductOptionsByIdsController);
router.get('/:id', getProductOptionByIdController);


module.exports = router;
