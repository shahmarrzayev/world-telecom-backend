const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const Category = require('./models/categoryModel');

const deleteCategoriesFromAncestors = async (categoryIds, transaction) => {
    winston.debug('categoryRepository.deleteCategoriesFromAncestors -- start');
    if (!categoryIds || !categoryIds.length) {
        winston.warn('categoryRepository.deleteCategoriesFromAncestors -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() =>
        Category.updateMany({}, { $pull: { ancestors: { _id: { $in: categoryIds } } } }, { session: transaction })
    );
    winston.debug('categoryRepository.deleteCategoriesFromAncestors -- success');
    return queryResult;
};

const deleteManyCategories = async (ids, transaction) => {
    winston.debug('categoryRepository.deleteManyCategories -- start');
    if (!ids || !ids.length) {
        winston.warn('categoryRepository.deleteManyCategories -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() => Category.deleteMany({ _id: { $in: ids } }, { session: transaction }));
    winston.debug('categoryRepository.deleteManyCategories -- success');
    return queryResult;
};

const findAllCategories = async transaction => {
    winston.debug('categoryRepository.findAllCategories -- start');
    const categories = await runQuery(() => Category.find().session(transaction));
    winston.debug('categoryRepository.findAllCategories -- success');
    return categories;
};

const findCategoriesInIds = async (ids, transaction) => {
    winston.debug('categoryRepository.findCategoriesInIds -- start');
    if (!ids || !ids.length) {
        winston.warn('categoryRepository.deleteManyCategories -- null or empty param');
        return null;
    }
    const categories = await runQuery(() => Category.find({ _id: { $in: ids } }).session(transaction));
    winston.debug('categoryRepository.findCategoriesInIds -- success');
    return categories;
};

const findCategoryById = async (id, transaction) => {
    winston.debug('categoryRepository.findCategoryById -- start');
    if (!id) {
        winston.warn('categoryRepository.findCategoryById -- null param');
        return null;
    }
    const category = await runQuery(() => Category.findById(id).session(transaction));
    winston.debug('categoryRepository.findCategoryById -- success');
    return category;
};

const findCategoryByName = async (name, transaction) => {
    winston.debug('categoryRepository.findCategoryByName -- start');
    if (!name) {
        winston.warn('categoryRepository.findCategoryByName -- null param');
        return null;
    }
    const category = await runQuery(() => Category.findOne({ name }).session(transaction));
    winston.debug('categoryRepository.findCategoryByName -- success');
    return category;
};

const findCategoryBySlug = async (slug, transaction) => {
    winston.debug('categoryRepository.findCategoryBySlug -- start');
    if (!slug) {
        winston.warn('categoryRepository.findCategoryBySlug -- null param');
        return null;
    }
    const category = await runQuery(() => Category.findOne({ slug }).session(transaction));
    winston.debug('categoryRepository.findCategoryBySlug -- success');
    return category;
};

const saveCategory = async (category, transaction) => {
    winston.debug('categoryRepository.saveCategory -- start');
    if (!category) {
        winston.warn('categoryRepository.saveCategory -- null param');
        return null;
    }
    const dbCategory = new Category(category);
    const savedCategory = await runQuery(() => dbCategory.save({ session: transaction }));
    winston.debug('categoryRepository.saveCategory -- success');
    return savedCategory;
};

const updateCategory = async (id, category, transaction) => {
    winston.debug('categoryRepository.updateCategory -- start');
    if (!id || !category) {
        winston.warn(`categoryRepository.updateCategory -- null param: ${id}, ${category}`);
        return null;
    }
    const categoryEntity = await runQuery(() =>
        Category.findByIdAndUpdate(id, category, {
            new: true,
            session: transaction,
            useFindAndModify: false,
        })
    );
    winston.debug('categoryRepository.updateCategory -- success');
    return categoryEntity;
};

module.exports = {
    deleteCategoriesFromAncestors,
    deleteManyCategories,
    findAllCategories,
    findCategoriesInIds,
    findCategoryById,
    findCategoryByName,
    findCategoryBySlug,
    saveCategory,
    updateCategory,
};
