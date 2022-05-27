const Joi = require('joi');

const validateParameterTemplate = template => {
    if (!template) {
        return 'Invalid request';
    }
    const { error } = Joi.validate(
        template,
        {
            name: Joi.string().required(),
            parameters: Joi.array().items(Joi.string()),
        },
        { allowUnknown: true }
    );
    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }
    return null;
};

module.exports = {
    validateParameterTemplate,
};
