const { pick } = require('lodash');

const mapBranchEntityToBranchAdminView = entity => {
    return entity
        ? pick(entity, ['_id', 'address', 'name', 'lat', 'lng', 'phone', 'type', 'order', 'createdAt'])
        : null;
};

module.exports = {
    mapBranchEntityToBranchAdminView,
};
