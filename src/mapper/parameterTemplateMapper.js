const { pick } = require('lodash');

const mapTemplateEntityToTemplateView = entity => {
    return entity ? pick(entity, ['_id', 'name', 'parameters', 'createdAt']) : null;
};

const mapTemplateViewToTemplateEntity = view => {
    return view ? pick(view, ['name', 'parameters']) : null;
};

module.exports = {
    mapTemplateEntityToTemplateView,
    mapTemplateViewToTemplateEntity,
};
