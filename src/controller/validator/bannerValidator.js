const Joi = require('joi');

const validateBanner = banner => {
    if (!banner) {
        return 'Invalid request';
    }

    const { error } = Joi.validate(
        banner,
        {
            image: Joi.string().required(),
            linkUri: Joi.string()
                .allow(null, '')
                .optional(),
            order: Joi.number()
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
    validateBanner,
};
