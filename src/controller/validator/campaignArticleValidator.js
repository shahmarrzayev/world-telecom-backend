const Joi = require('joi');

const { isValidDate } = require('../../utils/commonUtils');

const validateCampaignArticle = article => {
    if (!article) {
        return 'Invalid request';
    }

    const { error } = Joi.validate(
        article,
        {
            title: Joi.string().required(),
            subtitle: Joi.string()
                .allow(null, '')
                .optional(),
            description: Joi.string()
                .allow(null, '')
                .optional(),
            image: Joi.string()
                .allow(null, '')
                .optional(),
            thumbnail: Joi.string()
                .allow(null, '')
                .optional(),
            products: Joi.array()
                .items(
                    Joi.object({
                        productId: Joi.string(),
                        optionIds: Joi.array()
                            .items(Joi.string())
                            .allow([]),
                    })
                )
                .allow([])
                .optional(),
            published: Joi.boolean()
                .allow(null, '')
                .optional(),
            order: Joi.number()
                .allow(null, '')
                .optional(),
        },
        { allowUnknown: true }
    );
    if (error || (article.validUntil && !isValidDate(article.validUntil))) {
        return error && error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }

    return null;
};

module.exports = {
    validateCampaignArticle,
};
