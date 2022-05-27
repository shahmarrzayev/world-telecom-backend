const Joi = require('joi');

const validateAddToPopularProducts = order => {
    if (!order || typeof order !== 'number' || order < 1) {
        return 'Sıra müsbət nömrə olmalıdır';
    }
    return null;
};

const validateModifyByMemory = body => {
    if (!body) return null;
    const { error } = Joi.validate(body, {
        memory: Joi.string().required(),
        price: Joi.number()
            .optional()
            .allow('', null),
        discountedPrice: Joi.number()
            .optional()
            .allow('', null),
    });
    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }
    return null;
};

const validateProduct = body => {
    if (!body) {
        return 'Invalid request';
    }
    const { error } = Joi.validate(
        body,
        {
            manufacturer: Joi.string().required(),
            model: Joi.string().required(),
            categories: Joi.array()
                .items(Joi.string())
                .min(1)
                .required(),
            relatedProducts: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.string().required(),
                        order: Joi.number(),
                    })
                )
                .optional(),
            price: Joi.number().required(),
            isPopular: Joi.boolean().optional(),
            newProduct: Joi.boolean().optional(),
            popularityOrder: Joi.number()
                .allow(null)
                .optional(),
            newProductOrder: Joi.number()
                .allow(null)
                .optional(),
            tags: Joi.array()
                .items(Joi.string())
                .allow([])
                .optional(),
            onlinePaymentEnabled: Joi.boolean().optional(),
            albaliKartPaymentEnabled: Joi.boolean().optional(),
            birKartPaymentEnabled: Joi.boolean().optional(),
            birKartMonths: Joi.array()
                .items(Joi.number())
                .allow([], null)
                .optional(),
            tamKartPaymentEnabled: Joi.boolean().optional(),
            loanDescriptions: Joi.array()
                .items(Joi.string())
                .optional()
                .allow([]),
        },
        { allowUnknown: true }
    );
    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }
    return null;
};

const validateProductOption = productOption => {
    if (!productOption) {
        return 'Invalid request';
    }

    const { error } = Joi.validate(
        productOption,
        {
            oneSId: Joi.string()
                .allow(null, '')
                .optional(),
            campaigns: Joi.array()
                .items(
                    Joi.object({
                        _id: Joi.string(),
                    })
                )
                .allow(null, [], ''),
            color: Joi.string()
                .allow(null, '')
                .optional(),
            identificator: Joi.string()
                .allow(null, '')
                .optional(),
            images: Joi.array().items(Joi.string()),
            inStock: Joi.number()
                .allow(null, '')
                .optional(),
            isDefault: Joi.boolean().optional(),
            loanOptions: Joi.array().items(
                Joi.object({
                    _id: Joi.string(),
                    active: Joi.boolean(),
                    firstPayment: Joi.number(),
                    isMain: Joi.boolean().optional(),
                    loanOptionId: Joi.string().optional(),
                    period: Joi.number().optional(),
                    price: Joi.number().optional(),
                })
            ),
            parameters: Joi.array()
                .items(
                    Joi.object({
                        name: Joi.string().required(),
                        value: Joi.string()
                            .allow('', null)
                            .optional(),
                    })
                )
                .required(),
            price: Joi.number()
                .allow('', null)
                .optional(),
            discount: Joi.object({
                description: Joi.string()
                    .allow(null, '')
                    .optional(),
                price: Joi.number()
                    .allow(null, '')
                    .optional(),
            }).optional(),
            published: Joi.boolean().optional(),
        },
        { allowUnknown: true }
    );

    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }
    return null;
};

module.exports = {
    validateAddToPopularProducts,
    validateModifyByMemory,
    validateProduct,
    validateProductOption,
};
