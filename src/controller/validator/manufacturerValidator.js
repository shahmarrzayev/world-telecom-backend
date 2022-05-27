const Joi = require('joi');

const validateManufacturer = body => {
    if (!body) {
        return 'Invalid request';
    }

    const { error } = Joi.validate(
        body,
        {
            name: Joi.string().required(),
        },
        { allowUnknown: true }
    );

    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }

    return null;
};

module.exports = {
    validateManufacturer,
};
