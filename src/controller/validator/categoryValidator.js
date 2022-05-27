const Joi = require('joi');

const validateCategory = category => {
    if (!category) {
        return 'Invalid request';
    }

    const { error } = Joi.validate(
        category,
        {
            images: Joi.array().items(
                Joi.object({
                    image: Joi.string(),
                    href: Joi.string()
                })),
            parentId: Joi.string()
                .allow(null, '')
                .optional(),
            name: Joi.string()
                .min(1)
                .max(256)
                .required(),
            slug: Joi.string()
                .max(256)
                .allow(null, '')
                .optional(),
            showSubcategories: Joi.boolean()
                .allow(null, '')
                .optional(),
            seoTitle: Joi.string()
                .max(256)
                .optional()
                .allow(null, ''),
            seoDescription: Joi.string()
                .max(256)
                .optional()
                .allow(null, ''),
            description: Joi.string()
                .max(64000)
                .optional()
                .allow(null, ''),
        },
        { allowUnknown: true }
    );

    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }

    return null;
};

module.exports = {
    validateCategory,
};
