const Joi = require('joi');

const { StoreType } = require('../../enums');

const validateBranch = body => {
    if (!body) {
        return 'Invalid request';
    }

    const { error } = Joi.validate(
        body,
        {
            address: Joi.string().required(),
            name: Joi.string()
                .allow(null, '')
                .optional(),
            lat: Joi.string().required(),
            lng: Joi.string().required(),
            order: Joi.number()
                .allow(null, '')
                .optional(),
            phone: Joi.string()
                .allow(null, '')
                .optional(),
            type: Joi.string()
                .valid(Object.values(StoreType))
                .required(),
        },
        { allowUnknown: true }
    );

    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }

    return null;
};

module.exports = {
    validateBranch,
};
