const winston = require('winston');
const {
    validateAddToPopularProducts,
    validateModifyByMemory,
    validateProduct,
    validateProductOption,
} = require('./validator/productValidator');
const { validateArrayOfObjectIds } = require('./validator/commonValidator');
const { WTUserActivity } = require('../enums');
const { BadRequestException } = require('../exceptions');
const {
    mapProductEntityToView,
    mapProductEntityToAdminView,
    mapProductOptionEntityToView,
} = require('../mapper/productMapper');
const {
    addNewProduct,
    addNewProductOption,
    addToPopularProducts,
    getAllPopularProducts,
    getManyProductOptionsByIds,
    getManyProducts,
    getProductById,
    getProductOptionById,
    getProductOptionByProductIdAndId,
    getProductOptionBySlug,
    modifyProduct,
    modifyProductOption,
    modifyProductOptionsPricesByMemory,
    modifyAllProductPriceByOptionPrices,
    removeManyProducts,
} = require('../service/productService');
const { recordUserActivity } = require('../service/userActivityService');
const { mapCategoryEntityToCategoryView } = require('../mapper/categoryMapper');

/**
 * Add new product.
 */
const addNewProductController = async (req, res) => {
    winston.debug('productController.addNewProduct -- start');
    const { body, user } = req;
    const error = validateProduct(body);
    if (error) {
        winston.warn(`productController.addNewProduct -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const product = await addNewProduct(body, user._id);
    await recordUserActivity(user, WTUserActivity.ADD_PRODUCT);
    winston.debug('productController.addNewProduct -- success');
    return res.send(mapProductEntityToAdminView(product));
};

/**
 * Add new product option.
 */
const addNewProductOptionController = async (req, res) => {
    winston.debug('productController.addNewProductOption -- start');
    const { body, params, transaction, user } = req;
    const error = validateProductOption(body);
    if (error) {
        winston.warn(`productController.addNewProductOption -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const productOption = await addNewProductOption(params.id, body, user._id, transaction);
    await recordUserActivity(user, WTUserActivity.ADD_PRODUCT_OPTION, transaction);
    winston.debug('productController.addNewProductOption -- success');
    return res.send(mapProductOptionEntityToView(productOption));
};

/**
 * Add product to popular products.
 */
const addToPopularProductsController = async (req, res) => {
    winston.debug('productController.addToPopularProducts -- start');
    const { params, transaction } = req;
    const order = parseInt(params.order, 10);
    const error = validateAddToPopularProducts(order);
    if (error) {
        winston.warn(`productController.addToPopularProducts -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const product = await addToPopularProducts(params.id, order, transaction);
    await recordUserActivity(req.user, WTUserActivity.MAKE_PRODUCT_POPULAR, transaction);
    winston.debug('productController.addToPopularProducts -- success');
    return res.send(mapProductEntityToAdminView(product));
};

/**
 * Get all products.
 */
const getAllPopularProductsController = async (req, res) => {
    winston.debug('productController.getAllPopularProducts -- start');
    const products = await getAllPopularProducts();
    winston.debug('productController.getAllPopularProducts -- success');
    return res.send(products.map(mapProductEntityToAdminView));
};

/**
 * Get many products (with filters).
 */
const getManyProductsController = async (req, res) => {
    winston.debug('productController.getManyProducts -- start');
    const response = await getManyProducts(req.query);
    response.products = response.products.map(p => mapProductEntityToView(p, true));
    response.category = mapCategoryEntityToCategoryView(response.category);
    winston.debug('productController.getManyProducts -- success');
    return res.send(response);
};

/**
 * Get many product options.
 */
const getManyProductOptionsByIdsController = async (req, res) => {
    winston.debug('productController.getManyProductOptionsByIds -- start');
    const productOptionIds = req.query.id && req.query.id.length ? req.query.id : [];
    const productOptions =
        productOptionIds && productOptionIds.length
            ? await getManyProductOptionsByIds(productOptionIds.split(' '))
            : [];
    winston.debug('productController.getManyProductOptionsByIds -- success');
    return res.send(productOptions.map(mapProductOptionEntityToView));
};

/**
 * Get many products (admin panel).
 */
const getManyProductsPrivateController = async (req, res) => {
    winston.debug('productController.getManyProductsAdmin -- start');
    const response = await getManyProducts(req.query, req.user);
    response.products = response.products.map(mapProductEntityToAdminView);
    winston.debug('productController.getManyProductsAdmin -- success');
    return res.send(response);
};

/**
 * Get product by id.
 */
const getProductByIdController = async (req, res) => {
    winston.debug('productController.getProductById -- start');
    const product = await getProductById(req.params.id, req.user);
    winston.debug('productController.getProductById -- success');
    return res.send(mapProductEntityToAdminView(product));
};

/**
 * Get product by id (public).
 */
const getProductByIdPublicController = async (req, res) => {
    winston.debug('productController.getProductByIdPublic -- start');
    const product = await getProductById(req.params.id, req.user);
    winston.debug('productController.getProductByIdPublic -- success');
    return res.send(mapProductEntityToView(product));

};

/**
 * Get product option by id.
 */
const getProductOptionByIdController = async (req, res) => {
    winston.debug('productController.getProductOptionById -- start');
    const productOption = await getProductOptionById(req.params.id);
    winston.debug('productController.getProductOptionById -- success');
    return res.send(mapProductOptionEntityToView(productOption));
};

/**
 * Get product option by product id.
 */
const getProductOptionByProductIdAndIdController = async (req, res) => {
    winston.debug('productController.getProductOptionByProductIdAndId -- start');
    const productOption = await getProductOptionByProductIdAndId(req.params.id, req.params.optionId);
    winston.debug('productController.getProductOptionByProductIdAndId -- success');
    return res.send(mapProductOptionEntityToView(productOption));
};

/**
 * Get product option by slug.
 */
const getProductOptionBySlugController = async (req, res) => {
    winston.debug('productController.getProductOptionBySlug -- start');
    const productOption = await getProductOptionBySlug(req.params.slug);
    winston.debug('productController.getProductOptionBySlug -- success');
    return res.send(mapProductOptionEntityToView(productOption));
};

/**
 * Modify product.
 */
const modifyProductController = async (req, res) => {
    winston.debug('productController.modifyProduct -- start');
    const { body, params, transaction, user } = req;
    const error = validateProduct(body);
    if (error) {
        winston.warn(`productController.modifyProduct -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const product = await modifyProduct(params.id, body, user._id, transaction);
    await recordUserActivity(user, WTUserActivity.MODIFY_PRODUCT, transaction);
    winston.debug('productController.modifyProduct -- success');
    return res.send(mapProductEntityToAdminView(product));
};

/**
 * Modify product option.
 */
const modifyProductOptionController = async (req, res) => {
    winston.debug('productController.modifyProductOption -- start');
    const { body, params, transaction, user } = req;
    const error = validateProductOption(body);
    if (error) {
        winston.warn(`productController.modifyProductOption -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const productOption = await modifyProductOption(params.optionId, body, user._id, transaction);
    await recordUserActivity(user, WTUserActivity.MODIFY_PRODUCT_OPTION, transaction);
    winston.debug('productController.modifyProductOption -- success');
    return res.send(mapProductOptionEntityToView(productOption));
};

/**
 * Modify prices of product options with given product id and memory.
 */
const modifyProductOptionsPricesByMemoryController = async (req, res) => {
    winston.debug('productController.modifyProductOptionsPricesByMemory -- start');
    const error = validateModifyByMemory(req.body);
    if (error) {
        winston.warn(`productController.modifyProductOption -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    await modifyProductOptionsPricesByMemory(req.params.id, req.body, req.transaction);
    winston.debug('productController.modifyProductOptionsPricesByMemory -- success');
    return res.send();
};

const modifyAllProductPriceByOptionPricesController = async (req, res) => {
    winston.debug('productController.modifyProductPriceByOptionPrices -- start');
    await modifyAllProductPriceByOptionPrices();
    winston.debug('productController.modifyProductPriceByOptionPrices -- success');
    return res.send();
}

/**
 * Remove many products.
 */
const removeManyProductsController = async (req, res) => {
    winston.debug('productController.removeManyProducts -- start');
    const { body, transaction } = req;
    const error = validateArrayOfObjectIds(body);
    if (error) {
        winston.warn(`productController.removeManyProducts -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    await removeManyProducts(body, transaction);
    await recordUserActivity(req.user, WTUserActivity.DELETE_PRODUCT, transaction);
    winston.debug('productController.removeManyProducts -- success');
    return res.send();
};

module.exports = {
    addNewProductController,
    addNewProductOptionController,
    addToPopularProductsController,
    getAllPopularProductsController,
    getManyProductOptionsByIdsController,
    getManyProductsController,
    getManyProductsPrivateController,
    getProductByIdController,
    getProductByIdPublicController,
    getProductOptionByIdController,
    getProductOptionByProductIdAndIdController,
    getProductOptionBySlugController,
    modifyProductController,
    modifyProductOptionController,
    modifyProductOptionsPricesByMemoryController,
    modifyAllProductPriceByOptionPricesController,
    removeManyProductsController
};
