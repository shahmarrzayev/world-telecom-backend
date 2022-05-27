const {
    mapCategoryEntityToCategoryView,
    mapCategoryEntityToCategoryViewAdmin,
    mapCategoryViewToCategoryEntity,
} = require('../categoryMapper');

const categoryMock = {
    _id: '_id',
    parentId: 'parentId',
    name: 'name',
    slug: 'slug',
    ancestors: 'ancestors',
    isMain: 'isMain',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    manufacturers: 'manufacturers',
    subcategories: [
        {
            _id: '_id',
            parentId: 'parentId',
            name: 'name',
            slug: 'slug',
            ancestors: 'ancestors',
            isMain: 'isMain',
            createdBy: 'createdBy',
            updatedBy: 'updatedBy',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
            unknownParam: 'unknownParam',
        },
    ],
    unknownParam: 'unknownParam',
};

describe('categoryMapper', () => {
    describe('mapCategoryEntityToCategoryView', () => {
        test('success', () => {
            const view = mapCategoryEntityToCategoryView(categoryMock);

            expect(view._id).toBe(categoryMock._id);
            expect(view.parentId).toBe(categoryMock.parentId);
            expect(view.name).toBe(categoryMock.name);
            expect(view.slug).toBe(categoryMock.slug);
            expect(view.isMain).toBe(categoryMock.isMain);
            expect(view.manufacturers).toBe(categoryMock.manufacturers);

            expect(view.createdBy).not.toBeDefined();
            expect(view.updatedBy).not.toBeDefined();
            expect(view.createdAt).not.toBeDefined();
            expect(view.updatedAt).not.toBeDefined();
            expect(view.unknownParam).not.toBeDefined();

            expect(view.subcategories.length).toBe(1);
            expect(view.subcategories[0]._id).toBe(categoryMock._id);
            expect(view.subcategories[0].parentId).toBe(categoryMock.parentId);
            expect(view.subcategories[0].name).toBe(categoryMock.name);
            expect(view.subcategories[0].slug).toBe(categoryMock.slug);
            expect(view.subcategories[0].isMain).toBe(categoryMock.isMain);
            expect(view.subcategories[0].createdBy).not.toBeDefined();
            expect(view.subcategories[0].updatedBy).not.toBeDefined();
            expect(view.subcategories[0].createdAt).not.toBeDefined();
            expect(view.subcategories[0].updatedAt).not.toBeDefined();
            expect(view.subcategories[0].unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is null', () => {
            const view = mapCategoryEntityToCategoryView();

            expect(view).toBeNull();
        });
    });

    describe('mapCategoryEntityToCategoryViewAdmin', () => {
        test('success', () => {
            const view = mapCategoryEntityToCategoryViewAdmin(categoryMock);

            expect(view._id).toBe(categoryMock._id);
            expect(view.parentId).toBe(categoryMock.parentId);
            expect(view.name).toBe(categoryMock.name);
            expect(view.slug).toBe(categoryMock.slug);
            expect(view.isMain).toBe(categoryMock.isMain);
            expect(view.createdAt).toBe(categoryMock.createdAt);

            expect(view.createdBy).not.toBeDefined();
            expect(view.updatedBy).not.toBeDefined();
            expect(view.updatedAt).not.toBeDefined();
            expect(view.unknownParam).not.toBeDefined();
            expect(view.manufacturers).not.toBeDefined();
            expect(view.subcategories).not.toBeDefined();
        });

        test('returns null when entity param is null', () => {
            const view = mapCategoryEntityToCategoryViewAdmin();

            expect(view).toBeNull();
        });
    });

    describe('mapCategoryViewToCategoryEntity', () => {
        test('success', () => {
            const entity = mapCategoryViewToCategoryEntity(categoryMock);

            expect(entity.parentId).toBe(categoryMock.parentId);
            expect(entity.name).toBe(categoryMock.name);
            expect(entity.slug).toBe(categoryMock.slug);

            expect(entity._id).not.toBeDefined();
            expect(entity.isMain).not.toBeDefined();
            expect(entity.createdAt).not.toBeDefined();
            expect(entity.createdBy).not.toBeDefined();
            expect(entity.updatedBy).not.toBeDefined();
            expect(entity.updatedAt).not.toBeDefined();
            expect(entity.unknownParam).not.toBeDefined();
            expect(entity.manufacturers).not.toBeDefined();
            expect(entity.subcategories).not.toBeDefined();
        });

        test('returns null when view param is null', () => {
            const entity = mapCategoryViewToCategoryEntity();

            expect(entity).toBeNull();
        });
    });
});
