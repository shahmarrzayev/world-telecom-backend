const { orderBy } = require('lodash');
const slugify = require('slugify');
const winston = require('winston');

const { MAIN_CATEGORY_SLUGS } = require('../../constants');
const { findAllCategories } = require('../../repository/categoryRepository');
const { findDistinctManufacturersForCategory } = require('../../repository/productRepository');

/**
 * PRIVATE
 * Assigns 3rd level subcategories to be shown instead of manufacturers.
 * @param {CategoryEntity} subcategory
 * @param {Array<CategoryEntity>} allCategories
 * @returns {Array<CategoryEntity>}
 */
const assignThirdLevelSubcategories = (subcategory, allCategories) => {
    winston.debug('categoryHelper.assignThirdLevelSubcategories -- start');
    if (!subcategory || !allCategories || !allCategories.length) {
        winston.warn('categoryHelper.assignThirdLevelSubcategories -- null param');
        return [];
    }
    const thirdLevelSubcategories = [];
    allCategories.forEach(category => {
        if (subcategory._id.equals(category.parentId)) {
            thirdLevelSubcategories.push(category);
        }
    });
    winston.debug('categoryHelper.assignThirdLevelSubcategories -- success');
    return orderBy(thirdLevelSubcategories, [c => c.name.toLowerCase()], ['asc']);
};

/**
 * PRIVATE
 * Assigns available distinct manufacturers for each 2nd level subcategory.
 * @param {Array<CategoryEntity>} mainCategories
 * @param {Array<CategoryEntity>} allCategories
 * @returns {Promise<Array<CategoryEntity>>}
 */
const assignDistinctManufacturers = async (mainCategories, allCategories) => {
    winston.debug('categoryHelper.assignDistinctManufacturers -- start');
    if (!mainCategories || !mainCategories.length) {
        winston.debug('categoryHelper.assignDistinctManufacturers -- no categories provided');
        return;
    }

    /* TODO: Change to more readable loop. */
    for (let i = 0; i < mainCategories.length; i++) {
        const category = mainCategories[i];
        for (let j = 0; j < category.subcategories.length; j++) {
            const subcategory = category.subcategories[j];
            if (!subcategory || !subcategory.slug) {
                // eslint-disable-next-line no-continue
                continue;
            }

            if (subcategory.showSubcategories) {
                subcategory.subcategories = assignThirdLevelSubcategories(subcategory, allCategories);
            } else {
                const manufacturers = await findDistinctManufacturersForCategory(subcategory.slug);
                subcategory.manufacturers = manufacturers;
            }
        }
    }

    winston.debug('categoryHelper.assignDistinctManufacturers -- success');
    // eslint-disable-next-line consistent-return
    return mainCategories;
};

/**
 * Finds subcategories for each MAIN category and assigns it to them.
 * @param {Array<Category>} categories
 * @returns {Promise<Array<Category>>} categories with subcategories field
 */
const assignSubcategories = async categories => {
    winston.debug('categoryHelper.assignSubcategories -- start');
    let resultCategories = [];
    Object.keys(MAIN_CATEGORY_SLUGS).forEach(slug => {
        const mainCategory = categories.find(c => c.slug === MAIN_CATEGORY_SLUGS[slug]);
        if (!mainCategory) {
            return;
        }
        const subcategories = categories.filter(c => mainCategory._id.equals(c.parentId));
        mainCategory.subcategories = subcategories && subcategories.length ? subcategories : [];
        resultCategories.push(mainCategory);
    });
    resultCategories = await assignDistinctManufacturers(resultCategories, categories);
    winston.debug('categoryHelper.assignSubcategories -- success');
    return resultCategories;
};

/**
 * Build ancestors tree for category given its parent.
 * @param {Category} parentCategory
 * @returns {Array<Category>} ancestors
 */
const buildCategoryAncestors = parentCategory => {
    winston.debug('categoryHelper.buildCategoryAncestors -- start');
    if (!parentCategory) {
        winston.debug('categoryHelper.buildCategoryAncestors -- null param');
        return null;
    }
    const ancestors = parentCategory.ancestors && parentCategory.ancestors.length ? [...parentCategory.ancestors] : [];
    ancestors.push({
        _id: parentCategory._id,
        name: parentCategory.name,
        slug: parentCategory.slug,
    });
    winston.debug('categoryHelper.buildCategoryAncestors -- success');
    return ancestors;
};

/**
 * Generates slug for category from its name.
 * @param {String} categoryName
 * @returns {String} slug
 */
const generateSlug = category => {
    winston.debug('categoryHelper.generateSlug -- start');
    if (!category || !category.name) {
        winston.warn(`categoryHelper.generateSlug -- wrong input: ${category}`);
        return null;
    }
    const slug = category.slug ? slugify(category.slug.toLowerCase()) : slugify(category.name.toLowerCase());
    winston.debug('categoryHelper.generateSlug -- success');
    return slug;
};

/**
 * Finds and returns subcategories of category (if any).
 * @param {String} categorySlug
 * @returns {Promise<Array<Category>>} subcategories
 */
const getSubcategories = async categorySlug => {
    winston.debug('categoryHelper.getSubcategories -- start');
    const subcategories = [];
    const allCategories = await findAllCategories();
    allCategories.forEach(c => {
        const subcategory = c.ancestors.find(a => a.slug === categorySlug);
        if (subcategory) {
            subcategories.push(c.slug);
        }
    });
    winston.debug('categoryHelper.getSubcategories -- success');
    return subcategories;
};

module.exports = {
    assignDistinctManufacturers,
    assignSubcategories,
    buildCategoryAncestors,
    generateSlug,
    getSubcategories,
};
