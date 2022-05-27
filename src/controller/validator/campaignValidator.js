const Joi = require('joi');

const validateCampaign = campaign => {
    if (!campaign) {
        return 'Invalid request';
    }

    const { error } = Joi.validate(
        campaign,
        {
            active: Joi.boolean()
                .allow(null, '')
                .optional(),
            image: Joi.string()
                .allow(null, '')
                .optional(),
            name: Joi.string().required(),
            pricing: Joi.array().items(
                Joi.object({
                    from: Joi.number().allow(null, ''),
                    to: Joi.number().allow(null, ''),
                    price: Joi.number().allow(null, ''),
                })
            ),
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
    validateCampaign,
};
