const hash = require('object-hash');
const { orderBy } = require('lodash');
const slugify = require('slugify');
const winston = require('winston');
const { Cache } = require('../enums');
const { ConflictException, NotFoundException, GeneralException } = require('../exceptions');

const {
    checkAndPopulateLoans,
    checkIdentificator,
    detectColors,
    detectMemories,
    generateProductOptionFullName,
    getMemoryFromParameters,
    getSortAndFilterParamsFromRequestQuery,
    mapOneSPricesToProductOption,
    editTags,
} = require('./helper/productHelper');
const { mapProductViewToProductAdmin } = require('../mapper/productMapper');
const {
    deleteProductOptionInProductIds,
    findProdutOptionByProductAndOptionId,
    findProductOptionById,
    findProductOptionBySlug,
    findProductOptionsByOneSId,
    findProductOptionsByIds,
    findProductOptionsByProductId,
    saveProductOption,
    updateProductOption,
    updateProductOptionIsDefault,
    updateProductOptionsProductInfo,
    findAllProductOptions,
} = require('../repository/productOptionRepository');
const {
    countPopularProducts,
    countProducts,
    deleteManyProducts,
    findPopularProducts,
    findProductById,
    findProductByManufacturerAndModel,
    findProducts,
    saveProduct,
    updateProduct,
    findAllProducts,
} = require('../repository/productRepository');
const { getFromCache, flushCache, setInCache } = require('../utils/cacheUtils');

const { runQuery } = require('../repository/helper/repositoryHelper');

const SeoPage = require('../repository/models/seoPageModel');

/**
 * Add new product.
 * @param {ProductView} productView
 * @param {String} userId
 * @returns {Promise<ProductEntity>}
 */
const addNewProduct = async (productView, userId) => {
    winston.debug('productService.addNewProduct -- start');
    if (!productView || !userId) {
        winston.warn(`productService.addNewProduct -- null param: ${productView}, ${userId}`);
        throw new GeneralException();
    }

    let product = null;
    product = await findProductByManufacturerAndModel(productView.manufacturer, productView.model);
    if (product) {
        winston.warn('productService.addNewProduct -- product already exists');
        throw new ConflictException('Product already exists');
    }

    let productEntity = mapProductViewToProductAdmin(productView);
    productEntity.createdBy = userId;
    productEntity = await saveProduct(productEntity);
    if (!productEntity) {
        winston.warn('productService.addNewProduct -- could not save product');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('productService.addNewProduct -- success');
    return productEntity;
};

/**
 * Add new product option.
 * @param {String} productId
 * @param {ProductOptionView} productOption
 * @param {String} userId
 * @param {Transaction} transaction
 * @returns {Promise<ProductOptionEntity>}
 */
const addNewProductOption = async (productId, productOption, userId, transaction) => {
    winston.debug('productService.addNewProductOption -- start');
    if (!productId || !productOption || !userId) {
        winston.warn(`productService.addNewProductOption -- null param: ${productId}, ${productOption}, ${userId}`);
        throw new GeneralException();
    }

    const productEntity = await findProductById(productId);
    if (!productEntity) {
        winston.warn('productService.addNewProductOption -- product not found');
        throw new NotFoundException('Product not found');
    }

    checkIdentificator(productOption.identificator, productEntity.options);

    const productOptionEntity = productOption;
    productOptionEntity.productId = productId;
    productOptionEntity.slug = slugify(
        `${productEntity.manufacturer} ${productEntity.model} ${productOption.identificator || ''}`
    ).toLowerCase();
    productOptionEntity.product = {
        manufacturer: productEntity.manufacturer,
        model: productEntity.model,
        categories: productEntity.categories,
    };
    productOptionEntity.memory = getMemoryFromParameters(productOptionEntity.parameters);
    productOptionEntity.inStock = productOption.inStock || 0;
    productOptionEntity.price = productOption.price || productEntity.price;
    productOptionEntity.loanOptions = await checkAndPopulateLoans(productOption.loanOptions, userId, transaction);
    productOptionEntity.fullName = generateProductOptionFullName(productEntity, productOptionEntity);
    productOptionEntity.createdBy = userId;
    if (productOption.isDefault) {
        await updateProductOptionIsDefault(productEntity._id, false, transaction);
    }

    const savedProductOption = await saveProductOption(productOptionEntity, transaction);
    if (!savedProductOption) {
        winston.warn('productService.addNewProductOption -- could not save product options');
        throw new GeneralException();
    }

    productEntity.options.push(savedProductOption._id);
    productEntity.memoryOptions = detectMemories(productEntity.options);
    const savedProductEntity = await saveProduct(productEntity, transaction);
    if (!savedProductEntity) {
        winston.warn('productService.addNewProductOption -- could not save product');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('productService.addNewProductOption -- success');
    return savedProductOption;
};

/**
 * Add product to the popular products list.
 * @param {String} id
 * @param {Number} order
 * @param {Transaction} transaction
 * @returns {Promise<ProductEntity>}
 */
const addToPopularProducts = async (id, order, transaction) => {
    winston.debug('productService.addToPopularProducts -- start');
    if (!id || !order) {
        winston.warn(`productService.addToPopularProducts -- null param: ${id}, ${order}`);
        throw new GeneralException();
    }

    const [numberOfPopularProducts, productEntity] = await Promise.all([
        countPopularProducts(),
        findProductById(id, transaction),
    ]);
    if (numberOfPopularProducts && numberOfPopularProducts >= 36) {
        winston.warn('productService.addToPopularProducts -- max # of popular products reached');
        throw new ConflictException(`Ən çox 36 populyar məhsul əlavə etmək olar`);
    }
    if (!productEntity) {
        winston.warn('productService.addToPopularProducts -- product not found');
        throw new NotFoundException('Məhsul tapılmadı');
    }

    const { options } = productEntity;
    const publishedOptions = options && options.length ? options.filter(o => o.published) : null;
    if (!publishedOptions || !publishedOptions.length) {
        winston.warn('productService.addToPopularProducts -- product doesn not have published options');
        throw new GeneralException('Məhsulun nəşr olunmuş növü yoxdur!');
    }

    productEntity.isPopular = true;
    productEntity.popularityOrder = order;
    const savedProduct = await saveProduct(productEntity, transaction);
    if (!savedProduct) {
        winston.warn('productService.addToPopularProducts -- could not save product');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('productService.addToPopularProducts -- success');
    return savedProduct;
};

/**
 * Assings given oneS prices to products.
 * @param {OneSIdToPricesMapping} oneSIdToPrices
 * @param {Transaction} transaction
 */
const assignOneSPricesToProductOptions = async (oneSIdToPrices, transaction) => {
    winston.debug('productService.assignOneSPricesToProductOptions -- start');
    if (!oneSIdToPrices || !oneSIdToPrices.length) {
        winston.warn('productService.assignOneSPricesToProductOptions -- null param');
        throw new GeneralException();
    }

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < oneSIdToPrices.length; i++) {
        const productOptions = await findProductOptionsByOneSId(oneSIdToPrices[i].oneSId, transaction);
        if (!productOptions || !productOptions.length) return null;

        // eslint-disable-next-line no-plusplus
        for (let j = 0; j < productOptions.length; j++) {
            const updatedProductOption = mapOneSPricesToProductOption(productOptions[j], oneSIdToPrices[i]);
            await updateProductOption(updatedProductOption._id, updatedProductOption, transaction);
        }
    }
    flushCache();
    winston.debug('productService.assignOneSPricesToProductOptions -- success');
    return true;
};

/**
 * Get all popular products.
 * @returns {Promise<Array<ProductEntity>>}
 */
const getAllPopularProducts = async () => {
    winston.debug('productService.getAllPopularProducts -- start');
    let popularProducts = getFromCache(Cache.POPULAR_PRODUCTS);
    if (popularProducts) return popularProducts;

    popularProducts = await findPopularProducts();
    if (!popularProducts) {
        winston.warn('productService.getAllPopularProducts -- could not find products');
        throw new GeneralException();
    }
    popularProducts.forEach(p => {
        p.availableColors = detectColors(p.options, p.memoryOptions);
    });
    setInCache(Cache.POPULAR_PRODUCTS, popularProducts);
    winston.debug('productService.getAllPopularProducts -- success');
    return popularProducts;
};

/**
 * Get product options by ids.
 * @param {Array<String>} optionIds
 * @returns {Promise<Array<ProductOptionEntity>>}
 */
const getManyProductOptionsByIds = async optionIds => {
    winston.debug('productService.getManyProductOptionsByIds -- start');
    if (!optionIds || !optionIds.length) {
        winston.warn('productService.getManyProductOptionsByIds -- no ids provided');
        return [];
    }
    const productOptions = await findProductOptionsByIds(optionIds);
    winston.debug('productService.getManyProductOptionsByIds -- success');
    return productOptions;
};

/**
 * Get products by category.
 * @param {Request.query} requestQuery
 * @param {UserEntity} user
 * @returns {Promise<Object>} {limit, page, product, total}
 */
const getManyProducts = async (requestQuery, user) => {
    winston.debug('productService.getManyProducts -- start');
    if (!requestQuery) {
        winston.warn('productService.getManyProducts -- null param');
        throw new GeneralException();
    }

    const filterOptions = await getSortAndFilterParamsFromRequestQuery(requestQuery);
    if (!filterOptions) {
        winston.warn('productService.getManyProducts -- could not get filter options');
        throw new GeneralException();
    }

    const queryHash = hash(filterOptions);
    let result = getFromCache(queryHash);
    if (result) return result;

    filterOptions.published = user ? null : true;
    let { query, filter, products, categoryDetail } = (await findProducts(filterOptions)) || {};
    if (!products) {
        winston.warn('productService.getManyProducts -- could not get products');
        throw new GeneralException();
    }

    if (products.length) {
        products.forEach(p => {
            p.memoryOptions = detectMemories(p.options);
            p.availableColors = detectColors(p.options, p.memoryOptions);
        });
    }

    const totalNumberOfProducts = await countProducts(query, filter);

    const seoPages = await runQuery(() => SeoPage.find());
    for (let i = 0; i < products.length; i++) {
        products[i] = !user ? await editTags(products[i], seoPages) : products[i];
    }

    result = {
        limit: filterOptions.limit,
        page: filterOptions.page,
        category: categoryDetail,
        products: user ? products : products.filter(p => p.options.length),
        total: totalNumberOfProducts,
    };
    setInCache(queryHash, result);
    winston.debug('productService.getManyProducts -- success');
    return result;
};

/**
 * Get product by id.
 */
const getProductById = async (id, user) => {
    winston.debug('productService.getProductById -- start');

    if (!id) {
        winston.warn('productService.getProductById -- null param');
        throw new GeneralException();
    }

    const productEntity = getFromCache(`${Cache.PRODUCT}-${id}`);
    if (productEntity) {
        winston.debug('productService.getProductById -- success');
        return productEntity;
    }

    const [product, productOptions] = await Promise.all([findProductById(id), findProductOptionsByProductId(id)]);
    if (!product) {
        winston.warn(`productService.getProductById -- product not found for ${id}`);
        throw new NotFoundException('Product not found');
    }

    product.options = orderBy(productOptions, ['isDefault'], ['desc']);

    setInCache(`${Cache.PRODUCT}-${id}`, product);

    product.options = user ? product.options : product.options.filter(o => o.published);
    product.memoryOptions = detectMemories(product.options);
    product.availableColors = detectColors(product.options, product.memoryOptions);


    const seoPages = await runQuery(() => SeoPage.find());
    const editedProduct = !user ? await editTags(product, seoPages) : product;


    winston.debug('productService.getProductById -- success');
    return editedProduct;
};




/**
 * Get product option by id.
 * @param {String} id
 * @returns {Promise<ProductOptionEntity}
 */
const getProductOptionById = async id => {
    winston.debug('productService.getProductOptionById -- start');
    if (!id) {
        winston.warn('productService.getProductOptionById -- null param');
        throw new GeneralException();
    }

    const productOption = await findProductOptionById(id);
    if (!productOption) {
        winston.warn('productService.getProductOptionById -- product not found');
        throw new NotFoundException('Məhsul tapılmadı');
    }
    winston.debug('productService.getProductOptionById -- success');
    return productOption;
};

/**
 * Get product option by product id and product option id.
 * @param {String} id
 * @param {String} optionId
 * @returns {Promise<ProductOptionEntity>}
 */
const getProductOptionByProductIdAndId = async (id, optionId) => {
    winston.debug('productService.getProductOptionByProductIdAndId -- start');
    if (!id || !optionId) {
        winston.warn(`'productService.getProductOptionByProductIdAndId -- null param: ${id}, ${optionId}`);
        throw new GeneralException();
    }

    const productOption = await findProdutOptionByProductAndOptionId(id, optionId);
    if (!productOption) {
        winston.warn('productService.getProductOptionByProductIdAndId -- product option not found');
        throw new NotFoundException('Product not found');
    }
    winston.debug('productService.getProductOptionByProductIdAndId -- success');
    return productOption;
};

/**
 * Get product option by slug.
 * @param {String} slug
 * @returns {Promise<ProductOptionEntity>}
 */
const getProductOptionBySlug = async slug => {
    winston.debug('productService.getProductOptionBySlug -- start');
    if (!slug) {
        winston.warn('productService.getProductOptionBySlug -- null param');
        throw new GeneralException();
    }

    const productOption = await findProductOptionBySlug(slug);
    if (!productOption) {
        winston.warn('productService.getProductOptionBySlug -- not found');
        throw new NotFoundException();
    }
    winston.debug('productService.getProductOptionBySlug -- success');
    return productOption;
};

/**
 * Update product.
 * @param {String} id
 * @param {ProductView} product
 * @param {String} userId
 * @param {Transaction} transaction
 * @returns {Promise<ProductEntity>}
 */
const modifyProduct = async (id, product, userId, transaction) => {
    winston.debug('productService.modifyProduct -- start');
    if (!id || !product || !userId) {
        winston.warn(`productService.modifyProduct -- null param: ${id}, ${product}, ${userId}`);
        throw new GeneralException();
    }

    const productEntity = await findProductById(id, transaction);
    if (!productEntity) {
        winston.warn('productService.modifyProduct -- product not found');
        throw new NotFoundException('Product not found');
    }

    const productView = mapProductViewToProductAdmin(product);

    productView.memoryOptions = detectMemories(productEntity.options);
    productView.updatedBy = userId;

    const updatedProduct = await updateProduct(id, productView, transaction);
    if (!updatedProduct) {
        winston.warn('productService.modifyProduct -- product not found');
        throw new NotFoundException('Product not found');
    }

    await updateProductOptionsProductInfo(updatedProduct, transaction);
    flushCache();
    winston.debug('productService.modifyProduct -- success');
    return updatedProduct;
};

/**
 * Update product option.
 * @param {String} optionId
 * @param {ProductOptionView} option
 * @param {String} userId
 * @returns {Promise<ProductOptionEntity>}
 */
const modifyProductOption = async (optionId, option, userId, transaction) => {
    winston.debug('productService.modifyProductOption -- start');
    if (!optionId || !option || !userId) {
        winston.warn(`productService.modifyProductOption -- null param: ${optionId}, ${option}, ${userId}`);
        throw new GeneralException();
    }

    const [loanOptions, product] = await Promise.all([
        checkAndPopulateLoans(option.loanOptions, userId),
        findProductById(option.productId),
    ]);
    if (!product) {
        winston.warn('productService.modifyProductOption -- could not find product');
        throw new NotFoundException();
    }

    option.loanOptions = loanOptions;
    option.memory = getMemoryFromParameters(option.parameters);
    option.fullName = generateProductOptionFullName(option.product, option);
    option.slug = slugify(
        `${option.product.manufacturer} ${option.product.model} ${option.identificator || ''}`
    ).toLowerCase();
    const savedOption = await updateProductOption(optionId, option, transaction);
    if (!savedOption) {
        winston.warn('productService.modifyProductOption -- product option not found');
        throw new NotFoundException('Product option not found');
    }

    product.memoryOptions = detectMemories(product.options);
    const productUpdated = await updateProduct(product._id, product, transaction);
    if (!productUpdated) {
        winston.warn('productService.modifyProductOption -- could not update product');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('productService.modifyProductOption -- success');
    return savedOption;
};

/**
 * Updates prices for product options with given product id and memory.
 * @param {ObjectId} productId
 * @param {String} memory
 * @param {Number} price
 * @param {Transaction} transaction
 */
const modifyProductOptionsPricesByMemory = async (productId, option, transaction) => {
    winston.debug('productService.modifyProductOptionsPricesByMemory -- start');
    if (!productId) {
        winston.warn('productService.modifyProductOptionsPricesByMemory -- null param');
        throw new GeneralException();
    }

    const options = await findProductOptionsByProductId(productId);
    if (!options || !options.length) {
        winston.warn('productService.findProductOptionsByProductId -- no options');
        throw new GeneralException();
    }

    for (let i = 0; i < options.length; i++) {
        const o = options[i];
        if (o && o.memory === option.memory) {
            o.price = option.price || o.price;
            if (option.discountedPrice) {
                o.discount = o.discount || {};
                o.discount.price = option.discountedPrice;
                o.discount.description = `Nağd alışda ${o.price - o.discount.price} ₼ endirim`;
            }
            await updateProductOption(o._id, o, transaction);
        }
    }
    flushCache();
    winston.debug('productService.modifyProductOptionsPricesByMemory -- success');
};

const modifyAllProductPriceByOptionPrices = async (transaction) => {
    winston.debug('productService.modifyAllProductPriceByOptionPrices -- start');
    const products = (await findAllProducts(transaction)).filter(p => p && p.price);
    const productOptions = (await findAllProductOptions(transaction)).filter(o => o && o.price);

    for (let i = 0; i < products.length; i++) {
        const entityProduct = products[i];
        const entityProductOptions = productOptions.filter(option => option.productId.toString() === entityProduct._id.toString());
        if (!entityProductOptions.length){
            continue;
        }
        
        let minOptionPrice = entityProductOptions[0].price;
        for (let j = 0; j < entityProductOptions.length; j++) {
            if (entityProductOptions[j].published && (minOptionPrice > entityProductOptions[j].price)) {
                minOptionPrice = entityProductOptions[j].price;
            }
        }
        entityProduct.price = minOptionPrice;
        await updateProduct(entityProduct._id, entityProduct, transaction);
    }

    flushCache();
    winston.debug('productService.modifyAllProductPriceByOptionPrices -- success');
}

/**
 * Delete many products.
 * @param {Array<String>} productIds
 * @param {Transaction} transaction
 */
const removeManyProducts = async (productIds, transaction) => {
    winston.debug('productService.removeManyProducts -- start');
    if (!productIds || !productIds.length) {
        winston.warn('productService.removeManyProducts -- null or empty param');
        throw new GeneralException();
    }

    const [productsDeleted, productOptionsDeleted] = await Promise.all([
        deleteManyProducts(productIds, transaction),
        deleteProductOptionInProductIds(productIds, transaction),
    ]);
    if (!productsDeleted || !productOptionsDeleted) {
        winston.warn('productService.removeManyProducts -- could not delete products');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('productService.removeManyProducts -- success');
};

module.exports = {
    addNewProduct,
    addNewProductOption,
    addToPopularProducts,
    assignOneSPricesToProductOptions,
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
};
