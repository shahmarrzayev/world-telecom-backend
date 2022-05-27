const { pick } = require('lodash');

const mapFilterEntityToView = (entity) => {
    if (!entity) return null;
    return pick(entity, [
        '_id',
        'categoryName',
        'label',
        'filterKey',
        'filterValues'
    ])
}

const mapFilterEntityToAdminView = (entity) => {
    if (!entity) return null;
    return pick(entity, [
        '_id',
        'categoryName',
        'label',
        'filterOn',
        'filterKey',
        'filterValues'
    ])
}

module.exports = { mapFilterEntityToView, mapFilterEntityToAdminView }