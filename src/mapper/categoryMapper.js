const { pick } = require('lodash');

const mapCategoryEntityToCategoryView = entity => {
    if (!entity) return null;
    const viewFields = [
        '_id',
        'parentId',
        'name',
        'slug',
        'images',
        'isMain',
        'manufacturers',
        'showSubcategories',
        'seoTitle',
        'seoDescription',
        'description',
        'subcategories',
    ];
    const view = pick(entity, viewFields);
    view.subcategories =
        view.subcategories && view.subcategories.length ? view.subcategories.map(s => pick(s, viewFields)) : [];
    return view;
};

const mapCategoryEntityToCategoryViewAdmin = entity => {
    return entity
        ? pick(entity, [
            '_id',
            'parentId',
            'name',
            'slug',
            'ancestors',
            'images',
            'showSubcategories',
            'seoTitle',
            'seoDescription',
            'description',
            'isMain',
            'createdAt'
        ])
        : null;
};

const mapCategoryViewToCategoryEntity = view => {
    return view ? pick(view, [
        'parentId',
        'name',
        'images',
        'showSubcategories',
        'seoTitle',
        'seoDescription',
        'description',
        'slug'
    ]) : null;
};

module.exports = {
    mapCategoryEntityToCategoryView,
    mapCategoryEntityToCategoryViewAdmin,
    mapCategoryViewToCategoryEntity,
};
