const { pick } = require('lodash');

const mapNewsEntityToNewsView = entity => {
    return entity ? pick(entity, ['_id', 'title', 'content', 'image', 'published', 'video', 'createdAt']) : null;
};

const mapNewsViewToNewsEntity = view => {
    return view ? pick(view, ['title', 'content', 'image', 'published', 'video']) : null;
};

module.exports = {
    mapNewsEntityToNewsView,
    mapNewsViewToNewsEntity,
};
