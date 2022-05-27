const { orderBy } = require('lodash');
const winston = require('winston');
const { findCategoryBySlug } = require('./categoryRepository');

const { generateFilterAndQueryForProducts } = require('./helper/productRepositoryHelper');
const { getPaginationDetails, runQuery } = require('./helper/repositoryHelper');
const Product = require('./models/productModel');

const countPopularProducts = async transaction => {
    winston.debug('productRepository.countPopularProducts -- start');
    const count = await runQuery(() => Product.countDocuments({ isPopular: true }).session(transaction));
    winston.debug('productRepository.countPopularProducts -- success');
    return count;
};

const countProducts = async (query, filter, transaction) => {
    winston.debug('productRepository.countProducts -- start');
    const count = await runQuery(() =>
        Product.aggregate([
            {
                $lookup: {
                    from: 'productoptions',
                    localField: 'options',
                    foreignField: '_id',
                    as: 'options',
                },
            },
            {
                $addFields: {
                    options: {
                        $filter: filter,
                    },
                },
            },
            { $match: query },
            {
                $count: 'total',
            },
        ]).session(transaction)
    );
    winston.debug('productRepository.countProducts -- success');
    return count && count.length ? count[0].total : 0;
};

const deleteCategoriesFromProducts = async (categoryIds, transaction) => {
    winston.debug('productRepository.deleteCategoryFromProducts -- start');
    if (!categoryIds || !categoryIds.length) {
        winston.warn('productRepository.deleteCategoryFromProducts -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() =>
        Product.updateMany({}, { $pull: { categories: { _id: { $in: categoryIds } } } }, { session: transaction })
    );
    winston.debug('productRepository.deleteCategoryFromProducts -- success');
    return queryResult;
};

const deleteManyProducts = async (ids, transaction) => {
    winston.debug('productRepository.deleteManyProducts -- start');
    if (!ids || !ids.length) {
        winston.warn('productRepository.deleteManyProducts -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() => Product.deleteMany({ _id: { $in: ids } }, { session: transaction }));
    winston.debug('productRepository.deleteManyProducts -- success');
    return queryResult;
};

const findDistinctManufacturersForCategory = async (categorySlug, transaction) => {
    winston.debug('productRepository.findDistinctManufacturersForCategory -- start');
    if (!categorySlug) {
        winston.warn('productRepository.findDistinctManufacturersForCategory -- null param');
        return null;
    }
    const result = await runQuery(() =>
        Product.aggregate([
            {
                $lookup: {
                    from: 'productoptions',
                    localField: 'options',
                    foreignField: '_id',
                    as: 'options',
                },
            },
            {
                $match: { $and: [{ 'options.published': true }, { categories: categorySlug }] },
            },
            {
                $group: { _id: null, uniqueValues: { $addToSet: '$manufacturer' } },
            },
        ]).session(transaction)
    );
    if (!result || !result.length || !result[0].uniqueValues || !result[0].uniqueValues.length) return [];
    const manufacturers = result[0].uniqueValues.map(b => {
        return { name: b };
    });
    winston.debug('productRepository.findDistinctManufacturersForCategory -- success');
    return orderBy(manufacturers, [m => m.name.toLowerCase()], ['asc']);
};

const findManyProductsByIds = async (ids, transaction) => {
    winston.debug('productRepository.findManyProductsByIds -- start');
    if (!ids || !ids.length) return null;
    const products = await runQuery(() => Product.find({ _id: { $in: ids } }).session(transaction));
    winston.debug('productRepository.findManyProductsByIds -- success');
    return products;
};

const findNewProducts = async transaction => {
    winston.debug('productRepositoru.findNewProducts -- start');
    const products = await runQuery(() =>
        Product.find({ newProduct: true })
            .populate('options')
            .sort({ newProductOrder: 1 })
            .session(transaction)
    );
    winston.debug('productRepositoru.findNewProducts -- success');
    return products;
};

const findPopularProducts = async transaction => {
    winston.debug('productRepositoru.findPopularProducts -- start');
    const products = await runQuery(() =>
        Product.find({ isPopular: true })
            .populate('options')
            .sort({ popularityOrder: 1 })
            .session(transaction)
    );
    winston.debug('productRepository.findPopularProducts -- success');
    return products;
};

const findProductById = async (id, transaction) => {
    winston.debug('productRepository.findProductById -- start');
    if (!id) {
        winston.warn('productRepository.findProductById -- null param');
        return null;
    }
    const product = await runQuery(() =>
        Product.findById(id)
            .populate('options')
            .session(transaction)
    );
    winston.debug('productRepository.findProductById -- success');
    return product;
};

const findProductByManufacturerAndModel = async (manufacturer, model, transaction) => {
    winston.debug('productRepository.findProductByManufacturerAndModel -- start');
    if (!manufacturer || !model) {
        winston.warn(`productRepository.findProductByManufacturerAndModel -- null param: ${manufacturer}, ${model}`);
        return null;
    }
    const product = await runQuery(() => Product.findOne({ manufacturer, model }).session(transaction));
    winston.debug('productRepository.findProductByManufacturerAndModel -- success');
    return product;
};

const findProductByOptionId = async (id, transaction) => {
    winston.debug('productRepository.findProductByOptionId -- start');
    if (!id) {
        winston.warn(`productRepository.findProductByOptionId -- null param: ${id}`);
        return null;
    }
    const product = await runQuery(() =>
        Product.findOne({ options: id })
            .populate('options')
            .session(transaction)
    );
    winston.debug('productRepository.findProductByOptionId -- success');
    return product;
};

const findAllProducts = async (transaction) => {
    winston.debug('productRepository.findAllProducts -- start');
    const products = await runQuery(() => Product.find({}).session(transaction));
    winston.debug('productRepository.findAllProducts -- success');
    return products;
}

const findProducts = async (queryDetails, transaction) => {
    winston.debug('productRepository.findProducts -- start');
    const { limit, skip } = getPaginationDetails(queryDetails) || {};
    const { filter, query } = generateFilterAndQueryForProducts(queryDetails) || {};
    let sort = null;
    if (queryDetails && queryDetails.sort) {
        sort = queryDetails.sort === 'ASC' ? 1 : -1;
    }

    const products = await runQuery(() =>
        Product.aggregate([
            {
                $lookup: {
                    from: 'productoptions',
                    localField: 'options',
                    foreignField: '_id',
                    as: 'options',
                },
            },
            {
                $addFields: {
                    options: {
                        $filter: filter,
                    },
                },
            },
            { $match: query },
            { $sort: sort ? { price: sort } : { createdAt: 1 } },
            { $limit: limit },
            { $skip: skip },
        ]).session(transaction)
    );

    let categoryDetail;
    if (queryDetails.categories && queryDetails.categories.length) {
        categoryDetail = await findCategoryBySlug(queryDetails.categories[queryDetails.categories.length - 1]);
    }
    winston.debug('productRepository.findProducts -- success');
    return { query, filter, products, categoryDetail };
};

const saveProduct = async (product, transaction) => {
    winston.debug('productRepository.saveProduct -- start');
    if (!product) {
        winston.warn('productRepository.saveProduct -- null param');
        return null;
    }
    const dbProduct = new Product(product);
    const savedProduct = await runQuery(() => dbProduct.save({ session: transaction }));
    winston.debug('productRepository.saveProduct -- success');
    return savedProduct;
};

const updateManufacturerInProducts = async (manufacturer, newManufacturer, transaction) => {
    winston.debug('productRepository.updateManufacturerInProducts -- start');
    if (!manufacturer || !newManufacturer) {
        winston.warn(
            `productRepository.updateManufacturerInProducts -- null param: ${manufacturer}, ${newManufacturer}`
        );
        return null;
    }
    const queryResult = await runQuery(() =>
        Product.updateMany({ manufacturer }, { manufacturer: newManufacturer }, { session: transaction })
    );
    winston.debug('productRepository.updateManufacturerInProducts -- success');
    return queryResult;
};

const updateProduct = async (id, product, transaction) => {
    winston.debug('productRepository.updateProduct -- start');
    if (!id || !product) {
        winston.warn(`productRepository.updateProduct -- null param: ${id}, ${product}`);
        return null;
    }
    const updatedProduct = await runQuery(() =>
        Product.findByIdAndUpdate(id, product, {
            new: true,
            session: transaction,
            useFindAndModify: false,
        })
    );
    winston.debug('productRepository.updateProduct -- success');
    return updatedProduct;
};

module.exports = {
    countPopularProducts,
    countProducts,
    deleteCategoriesFromProducts,
    deleteManyProducts,
    findDistinctManufacturersForCategory,
    findManyProductsByIds,
    findNewProducts,
    findPopularProducts,
    findProductById,
    findProductByManufacturerAndModel,
    findProductByOptionId,
    findAllProducts,
    findProducts,
    saveProduct,
    updateManufacturerInProducts,
    updateProduct,
};
