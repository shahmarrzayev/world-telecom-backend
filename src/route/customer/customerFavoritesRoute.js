const express = require('express');

const { UserRole } = require('../../enums');
const {
    addNumberToFavoritesController,
    addProductToFavoritesController,
    clearFavoritesController,
    getAllFavoritesController,
    removeItemFromFavoritesController,
    addManyProductsToFavoritesController,
} = require('../../controller/customerFavoritesController');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/', role(UserRole.CUSTOMER), getAllFavoritesController);

router.post('/clear', role(UserRole.CUSTOMER), clearFavoritesController);
router.post('/number/:optionId', role(UserRole.CUSTOMER), addNumberToFavoritesController);
router.post('/product/:optionId', role(UserRole.CUSTOMER), addProductToFavoritesController);
router.post('/', role(UserRole.CUSTOMER), addManyProductsToFavoritesController);

router.post('/:id', role(UserRole.CUSTOMER), removeItemFromFavoritesController);
router.delete('/:id', role(UserRole.CUSTOMER), removeItemFromFavoritesController);

module.exports = router;
