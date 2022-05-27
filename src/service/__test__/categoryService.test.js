jest.mock('winston');
jest.mock('../helper/categoryHelper');
jest.mock('../../mapper/categoryMapper');
jest.mock('../../repository/categoryRepository');
jest.mock('../../repository/productRepository');
jest.mock('../../utils/cacheUtils');

const { addNewCategory, getAllCategories, modifyCategory, removeCategories } = require('../categoryService');
const { buildCategoryAncestors, generateSlug } = require('../helper/categoryHelper');
const { ConflictException, GeneralException, NotFoundException } = require('../../exceptions');
const { mapCategoryViewToCategoryEntity } = require('../../mapper/categoryMapper');
const {
    deleteManyCategories,
    deleteCategoriesFromAncestors,
    findAllCategories,
    findCategoryById,
    findCategoryByName,
    findCategoriesInIds,
    saveCategory,
    updateCategory,
} = require('../../repository/categoryRepository');
const { deleteCategoriesFromProducts } = require('../../repository/productRepository');
const { getFromCache, flushCache, setInCache } = require('../../utils/cacheUtils');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    buildCategoryAncestors.mockReturnValue('ancestors');
    deleteCategoriesFromAncestors.mockImplementation(() => Promise.resolve('deleted'));
    deleteCategoriesFromProducts.mockImplementation(() => Promise.resolve('deleted'));
    deleteManyCategories.mockImplementation(() => Promise.resolve('deleted'));
    generateSlug.mockReturnValue('slug');
    getFromCache.mockReturnValue('fromCache');
    mapCategoryViewToCategoryEntity.mockReturnValue('categoryEntity');
    findAllCategories.mockReturnValue(Promise.resolve(['category1', 'category2']));
    findCategoryById.mockReturnValue('categoryEntity');
    findCategoryByName.mockReturnValue(Promise.resolve(null));
    findCategoriesInIds.mockReturnValue(Promise.resolve(['category1', 'category2']));
    flushCache.mockImplementation(() => {});
    saveCategory.mockReturnValue(Promise.resolve('savedCategoryEntity'));
    setInCache.mockImplementation(() => {});
    updateCategory.mockReturnValue(Promise.resolve('updatedCategoryEntity'));
});

describe('categoryService', () => {
    describe('addNewCategory', () => {
        test('success - without parent id', async () => {
            const result = await addNewCategory('categoryView', 'userId');

            expect(result).toBe('savedCategoryEntity');
            expect(mapCategoryViewToCategoryEntity).toHaveBeenCalledTimes(1);
            expect(findCategoryByName).toHaveBeenCalledTimes(1);
            expect(findCategoryById).toHaveBeenCalledTimes(0);
            expect(buildCategoryAncestors).toHaveBeenCalledTimes(0);
            expect(generateSlug).toHaveBeenCalledTimes(1);
            expect(saveCategory).toHaveBeenCalledTimes(1);
        });

        test('success - with parent id', async () => {
            mapCategoryViewToCategoryEntity.mockReturnValue({ parentId: 'parentId' });

            const result = await addNewCategory('categoryView', 'userId');

            expect(result).toBe('savedCategoryEntity');
            expect(mapCategoryViewToCategoryEntity).toHaveBeenCalledTimes(1);
            expect(findCategoryByName).toHaveBeenCalledTimes(1);
            expect(findCategoryById).toHaveBeenCalledTimes(1);
            expect(buildCategoryAncestors).toHaveBeenCalledTimes(1);
            expect(generateSlug).toHaveBeenCalledTimes(1);
            expect(saveCategory).toHaveBeenCalledTimes(1);
        });

        test('throws general exceptin when categoryView param is null', async () => {
            await expect(addNewCategory(null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exceptin when userId param is null', async () => {
            await expect(addNewCategory('categoryView', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws conflict exception when category with such name exists', async () => {
            findCategoryByName.mockReturnValue(Promise.resolve('categoryEntity'));

            await expect(addNewCategory('categoryView', 'userId')).rejects.toEqual(expect.any(ConflictException));
        });

        test('throws not found exception when parent category not found', async () => {
            findCategoryById.mockReturnValue(Promise.resolve(null));
            mapCategoryViewToCategoryEntity.mockReturnValue({ parentId: 'parentId' });

            await expect(addNewCategory('categoryView', 'userId')).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws general exception when cannot build ancestors', async () => {
            buildCategoryAncestors.mockReturnValue(null);
            mapCategoryViewToCategoryEntity.mockReturnValue({ parentId: 'parentId' });

            await expect(addNewCategory('categoryView', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot save category', async () => {
            saveCategory.mockReturnValue(Promise.resolve(null));

            await expect(addNewCategory('categoryView', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getAllCategories', () => {
        test('success - hits the cache', async () => {
            const result = await getAllCategories();

            expect(result).toBe('fromCache');
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findAllCategories).toHaveBeenCalledTimes(0);
            expect(setInCache).toHaveBeenCalledTimes(0);
        });

        test('success - gets from db', async () => {
            getFromCache.mockReturnValue(null);

            const result = await getAllCategories();

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findAllCategories).toHaveBeenCalledTimes(1);
            expect(setInCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when cannot get categories', async () => {
            findAllCategories.mockReturnValue(Promise.resolve(null));
            getFromCache.mockReturnValue(null);

            await expect(getAllCategories()).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('modifyCategory', () => {
        test('success', async () => {
            const result = await modifyCategory('id', 'categoryView');

            expect(result).toBe('updatedCategoryEntity');
            expect(mapCategoryViewToCategoryEntity).toHaveBeenCalledTimes(1);
            expect(findCategoryById).toHaveBeenCalledTimes(0);
            expect(buildCategoryAncestors).toHaveBeenCalledTimes(0);
            expect(generateSlug).toHaveBeenCalledTimes(1);
            expect(updateCategory).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('success - with parent id', async () => {
            const result = await modifyCategory('id', { parentId: 'id' });

            expect(result).toBe('updatedCategoryEntity');
            expect(mapCategoryViewToCategoryEntity).toHaveBeenCalledTimes(1);
            expect(findCategoryById).toHaveBeenCalledTimes(1);
            expect(buildCategoryAncestors).toHaveBeenCalledTimes(1);
            expect(generateSlug).toHaveBeenCalledTimes(1);
            expect(updateCategory).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param is null', async () => {
            await expect(modifyCategory(null, 'categoryView')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when categoryView param is null', async () => {
            await expect(modifyCategory('id', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when parent category not found', async () => {
            findCategoryById.mockReturnValue(Promise.resolve(null));

            await expect(modifyCategory('id', { parentId: 'id' })).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws not found exception when updated category entity is null', async () => {
            updateCategory.mockReturnValue(Promise.resolve(null));

            await expect(modifyCategory('id', 'categoryView')).rejects.toEqual(expect.any(NotFoundException));
        });
    });

    describe('removeCategories', () => {
        test('success', async () => {
            await removeCategories(['cateogory1', 'category2']);

            expect(findCategoriesInIds).toHaveBeenCalledTimes(1);
            expect(deleteManyCategories).toHaveBeenCalledTimes(1);
            expect(deleteCategoriesFromAncestors).toHaveBeenCalledTimes(1);
            expect(deleteCategoriesFromProducts).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when categoryIds param is null', async () => {
            await expect(removeCategories(null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when categoryIds param is empty array', async () => {
            await expect(removeCategories([])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when one or more categories not found', async () => {
            findCategoriesInIds.mockReturnValue(Promise.resolve(['category1']));

            await expect(removeCategories(['cateogory1', 'category2'])).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws general exception when cannot delete categories', async () => {
            deleteManyCategories.mockReturnValue(Promise.resolve(null));

            await expect(removeCategories(['cateogory1', 'category2'])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete categories from ancestors', async () => {
            deleteCategoriesFromAncestors.mockReturnValue(Promise.resolve(null));

            await expect(removeCategories(['cateogory1', 'category2'])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete categories from ancestors', async () => {
            deleteCategoriesFromProducts.mockReturnValue(Promise.resolve(null));

            await expect(removeCategories(['cateogory1', 'category2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
