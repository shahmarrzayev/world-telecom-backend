const Joi = require('joi');

const { UserRole } = require('../../enums');

const validateAddNewRole = role => {
    if (!role) {
        return 'Invalid request';
    }
    const { error } = Joi.validate(role, {
        name: Joi.string().required(),
        ancestor: Joi.string()
            .valid(Object.values(UserRole))
            .allow(null, '')
            .optional(),
    });
    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }
    return null;
};

module.exports = {
    validateAddNewRole,
};
