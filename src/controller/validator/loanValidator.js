const Joi = require('joi');

const validateLoan = body => {
    if (!body) {
        return 'Invalid request';
    }

    const { error } = Joi.validate(
        body,
        {
            title: Joi.string().required(),
            image: Joi.string()
                .allow(null, '')
                .optional(),
            color: Joi.string()
                .allow(null, '')
                .optional(),
        },
        { allowUnknown: true }
    );

    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }

    return null;
};

module.exports = {
    validateLoan,
};
