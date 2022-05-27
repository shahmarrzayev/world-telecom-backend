const { pick } = require('lodash');

const mapParameterEntityToParameterView = entity => {
    return entity ? pick(entity, ['_id', 'name', 'createdAt']) : null;
};

const mapParameterViewToParameterEntity = view => {
    return view ? pick(view, ['name']) : null;
};

module.exports = {
    mapParameterEntityToParameterView,
    mapParameterViewToParameterEntity,
};
