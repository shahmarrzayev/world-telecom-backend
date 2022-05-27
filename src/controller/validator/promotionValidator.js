const Joi = require('joi');

const validatePromotion = body => {
    if (!body) {
        return 'Invalid request';
    }
    const { error } = Joi.validate(
        body,
        {
            active: Joi.boolean().optional(),
            image: Joi.string().required(),
            productId: Joi.string().required(),
        },
        { allowUnknown: true }
    );
    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }
    return null;
};

module.exports = {
    validatePromotion,
};
