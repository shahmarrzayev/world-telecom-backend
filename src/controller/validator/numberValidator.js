const Joi = require('joi');

const { NumberStatus } = require('../../enums');

const validateNumber = view => {
    if (!view) {
        return 'Invalid request';
    }
    const { error } = Joi.validate(
        view,
        {
            operator: Joi.string()
                .min(3)
                .max(3)
                .required(),
            number: Joi.string()
                .min(7)
                .max(7)
                .required(),
            price: Joi.number()
                .allow(null, '')
                .optional(),
            loanPrice: Joi.number()
                .allow(null, '')
                .optional(),
            status: Joi.string()
                .valid(Object.values(NumberStatus))
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
    validateNumber,
};
