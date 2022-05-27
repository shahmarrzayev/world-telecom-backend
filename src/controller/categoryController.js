const winston = require('winston');

const { validateCategory } = require('./validator/categoryValidator');
const { validateArrayOfObjectIds } = require('./validator/commonValidator');
const { WTUserActivity } = require('../enums');
const { BadRequestException } = require('../exceptions');
const { mapCategoryEntityToCategoryViewAdmin } = require('../mapper/categoryMapper');
const {
    addNewCategory,
    getAllCategories,
    getCategoryDetailedInfo,
    modifyCategory,
    removeCategories,
} = require('../service/categoryService');
const { recordUserActivity } = require('../service/userActivityService');

/**
 * Add new category.
 */
const addNewCategoryController = async (req, res) => {
    winston.debug('categoryController.addNewCategory -- start');
    const { body, transaction, user } = req;
    const error = validateCategory(body);
    if (error) {
        winston.warn(`categoryController.addNewCategoryAdmin -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const categoryEntity = await addNewCategory(body, user._id, transaction);
    await recordUserActivity(user, WTUserActivity.ADD_CATEGORY, transaction);
    winston.debug('categoryController.addNewCategoryAdmin -- success');
    return res.send(mapCategoryEntityToCategoryViewAdmin(categoryEntity));
};

/**
 * Get all categories.
 */
const getAllCategoriesController = async (req, res) => {
    winston.debug('categoryController.getAllCategories -- start');
    const categories = await getAllCategories();
    winston.debug('categoryController.getAllCategories -- success');
    return res.send(categories.map(mapCategoryEntityToCategoryViewAdmin));
};

/**
 * Get category detailed information.
 */
const getCategoryDetailedInfoController = async (req, res) => {
    winston.debug('categoryController.getCategoryDetailedInfo -- start');
    const result = await getCategoryDetailedInfo(req.params.slug);
    result.category = mapCategoryEntityToCategoryViewAdmin(result.category);
    winston.debug('categoryController.getCategoryDetailedInfo -- success');
    return res.send(result);
};

/**
 * Modify category.
 */
const modifyCategoryController = async (req, res) => {
    winston.debug('categoryController.updateCategory -- start');
    const { body, params, transaction } = req;
    const error = validateCategory(body);
    if (error) {
        winston.warn(`categoryController.updateCategory -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const categoryEntity = await modifyCategory(params.id, body, transaction);
    await recordUserActivity(req.user, WTUserActivity.MODIFY_CATEGORY, transaction);
    winston.debug('categoryController.updateCategory -- success');
    return res.send(mapCategoryEntityToCategoryViewAdmin(categoryEntity));
};

/**
 * Remove many categories.
 */
const removeCategoriesController = async (req, res) => {
    winston.debug('categoryController.removeCategories -- start');
    const { body, transaction } = req;
    const error = validateArrayOfObjectIds(body);
    if (error) {
        winston.warn(`categoryController.removeCategories -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    await removeCategories(body, transaction);
    await recordUserActivity(req.user, WTUserActivity.DELETE_CATEGORY, transaction);
    winston.debug('categoryController.removeCategories -- success');
    return res.send();
};

module.exports = {
    addNewCategoryController,
    getAllCategoriesController,
    getCategoryDetailedInfoController,
    modifyCategoryController,
    removeCategoriesController,
};
