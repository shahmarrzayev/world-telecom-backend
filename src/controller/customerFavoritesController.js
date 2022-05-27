const { mapCustomerEntityToPublicDto } = require('../mapper/customerMapper');
const { mapNumberEntityToNumberView } = require('../mapper/numberMapper');
const { mapProductOptionEntityToView } = require('../mapper/productMapper');
const {
    addNumberToFavorites,
    addProductToFavorites,
    clearFavorites,
    getAllFavorites,
    removeItemFromFavorites,
    addManyProductsToFavorites,
} = require('../service/customerFavoritesService');

const addNumberToFavoritesController = async (req, res) => {
    const customer = await addNumberToFavorites(req.user, req.params.numberId);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

const addProductToFavoritesController = async (req, res) => {
    const customer = await addProductToFavorites(req.user, req.params.optionId);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

const addManyProductsToFavoritesController = async (req, res) => {
    const customer = await addManyProductsToFavorites(req.user, req.body);
    return res.send(mapCustomerEntityToPublicDto(customer));
}

const clearFavoritesController = async (req, res) => {
    const customer = await clearFavorites(req.user);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

const getAllFavoritesController = async (req, res) => {
    const { numbers, productOptions } = (await getAllFavorites(req.user)) || {};
    return res.send({
        numbers: numbers ? numbers.map(mapNumberEntityToNumberView) : null,
        productOptions: productOptions ? productOptions.map(mapProductOptionEntityToView) : null,
    });
};

const removeItemFromFavoritesController = async (req, res) => {
    const customer = await removeItemFromFavorites(req.user, req.params.id);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

module.exports = {
    addNumberToFavoritesController,
    addProductToFavoritesController,
    addManyProductsToFavoritesController,
    clearFavoritesController,
    getAllFavoritesController,
    removeItemFromFavoritesController,
};
