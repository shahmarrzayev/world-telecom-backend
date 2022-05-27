const { pick } = require('lodash');

const mapUserEntityToUserView = entity => {
    if (!entity) return null;
    const userView = pick(entity, ['email', 'firstName', 'lastName', 'patronymic', 'cart']);
    userView.id = entity._id;

    return userView;
};

module.exports = {
    mapUserEntityToUserView,
};
