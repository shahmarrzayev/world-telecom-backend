const { pick } = require('lodash');

const mapManufacturerEntityToManufacturerView = entity => {
    return entity ? pick(entity, ['_id', 'name', 'createdAt']) : null;
};

const mapManufacturerViewToManufacturerEntity = view => {
    return view ? pick(view, ['name']) : null;
};

module.exports = {
    mapManufacturerEntityToManufacturerView,
    mapManufacturerViewToManufacturerEntity,
};
