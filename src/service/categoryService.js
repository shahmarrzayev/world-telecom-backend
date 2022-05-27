const winston = require('winston');

const { Cache } = require('../enums');
const { ConflictException, NotFoundException, GeneralException } = require('../exceptions');
const { buildCategoryAncestors, generateSlug } = require('./helper/categoryHelper');
const { mapCategoryViewToCategoryEntity } = require('../mapper/categoryMapper');
const {
    deleteCategoriesFromAncestors,
    deleteManyCategories,
    findAllCategories,
    findCategoriesInIds,
    findCategoryById,
    findCategoryByName,
    saveCategory,
    updateCategory,
} = require('../repository/categoryRepository');
const { deleteCategoriesFromProducts } = require('../repository/productRepository');
const { getFromCache, flushCache, setInCache } = require('../utils/cacheUtils');

/**
 * Add new category.
 * @param {CategoryView} categoryView
 * @param {String} userId
 * @param {Transaction} transaction
 * @returns {Promise<CategoryEntity>}
 */
const addNewCategory = async (categoryView, userId, transaction) => {
    winston.debug('categoryService.addNewCategory -- start');
    if (!categoryView || !userId) {
        winston.error(`categoryService.addNewCategory -- null param: ${categoryView}, ${userId}`);
        throw new GeneralException();
    }

    const catregoryNameExists = await findCategoryByName(categoryView.name);
    if (catregoryNameExists) {
        winston.warn('categoryService.addNewCategory -- category with this name exists');
        throw new ConflictException('Kateqoriya artıq mövcüddur');
    }

    const categoryEntity = mapCategoryViewToCategoryEntity(categoryView);

    if (categoryEntity.parentId) {
        const parentCategory = await findCategoryById(categoryEntity.parentId);
        if (!parentCategory) {
            winston.warn('categoryService.addNewCategory -- parent category not found');
            throw new NotFoundException('Üst kateqoriya tapılmadı');
        }

        const ancestors = buildCategoryAncestors(parentCategory);
        if (!ancestors) {
            winston.warn('categoryService.addNewCategory -- could not construct ancestors');
            throw new GeneralException();
        }
        categoryEntity.ancestors = ancestors;
    }

    categoryEntity.slug = generateSlug(categoryEntity);
    categoryEntity.createdBy = userId;
    const savedCategoryEntity = await saveCategory(categoryEntity, transaction);
    if (!savedCategoryEntity) {
        winston.warn('categoryService.addNewCategory -- could not save category');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('categoryService.addNewCategory -- success');
    return savedCategoryEntity;
};

/**
 * Get all categories.
 * @returns {Promise<Array<CategoryEntity>>}
 */
const getAllCategories = async () => {
    winston.debug('categoryService.getAllCategories -- start');
    let categories = getFromCache(Cache.CATEGORIES);
    if (categories) return categories;

    categories = await findAllCategories();
    if (!categories) {
        winston.warn('categoryService.getAllCategories -- could not get categories');
        throw new GeneralException();
    }

    setInCache(Cache.CATEGORIES, categories);
    winston.debug('categoryService.getAllCategories -- success');
    return categories;
};

/**
 * Returns detailed info (ancestors, children) about category.
 * @param {String} slug
 * @returns {Promise<Object>}
 */
const getCategoryDetailedInfo = async slug => {
    winston.debug('categoryService.getCategoryDetailedInfo -- start');
    const allCategories = await getAllCategories();

    const category = allCategories.find(c => c.slug === slug);
    if (!category) {
        winston.warn('categoryService.getCategoryDetailedInfo -- category not found');
        throw new NotFoundException('Kateqoriya tapılmadı');
    }

    const children = allCategories.filter(c => category._id.equals(c.parentId));
    winston.debug('categoryService.getCategoryDetailedInfo -- success');
    return { ancestors: category.ancestors, category, children };
};

/**
 * Update category.
 * @param {String} id
 * @param {CategoryView} categoryView
 * @param {Transaction} transaction
 * @returns {Promise<CategoryEntity>}
 */
const modifyCategory = async (id, categoryView, transaction) => {
    winston.debug('categoryService.modifyCategory -- start');
    if (!id || !categoryView) {
        winston.error(`categoryService.modifyCategory -- null param: ${id}, ${categoryView}`);
        throw new GeneralException();
    }

    const categoryEntity = mapCategoryViewToCategoryEntity(categoryView);

    if (categoryView.parentId) {
        const parentCategoryEntity = await findCategoryById(categoryView.parentId);
        if (!parentCategoryEntity) {
            winston.warn('categoryService.modifyCategory -- parent category not found');
            throw new NotFoundException('Üst kateqoriya tapılmadı');
        }
        categoryEntity.ancestors = buildCategoryAncestors(parentCategoryEntity);
    }

    categoryEntity.slug = generateSlug(categoryEntity);
    const updatedCategoryEntity = await updateCategory(id, categoryEntity, transaction);
    if (!updatedCategoryEntity) {
        winston.warn('categoryService.modifyCategory -- category not found');
        throw new NotFoundException();
    }

    flushCache();
    winston.debug('categoryService.modifyCategory -- success');
    return updatedCategoryEntity;
};

/**
 * Remove many categories.
 * @param {Array<String>} categoryIds
 */
const removeCategories = async (categoryIds, transaction) => {
    winston.debug('categoryService.removeCategories -- start');
    if (!categoryIds || categoryIds.length === 0) {
        winston.error(`categoryService.removeCategories -- null or empty param: ${categoryIds}`);
        throw new GeneralException();
    }

    const categoryEntities = await findCategoriesInIds(categoryIds);
    if (categoryEntities.length !== categoryIds.length) {
        winston.warn('categoryService.removeCategories -- category not found');
        throw new NotFoundException('Kateqoriya tapılmadı');
    }

    const [categoriesDeleted, deletedFromAncestors, deletedFromProducts] = await Promise.all([
        deleteManyCategories(categoryIds, transaction),
        deleteCategoriesFromAncestors(categoryIds, transaction),
        deleteCategoriesFromProducts(categoryIds, transaction),
    ]);

    if (!categoriesDeleted || !deletedFromAncestors || !deletedFromProducts) {
        winston.warn('categoryService.removeCategories -- could not delete categories');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('categoryService.removeCategories -- success');
};

module.exports = {
    addNewCategory,
    getAllCategories,
    getCategoryDetailedInfo,
    modifyCategory,
    removeCategories,
};
