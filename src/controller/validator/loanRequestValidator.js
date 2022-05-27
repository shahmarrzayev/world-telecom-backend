const Joi = require('joi');

const validateLoanRequest = body => {
    if (!body) {
        return 'Invalid request';
    }

    const { error } = Joi.validate(
        body,
        {
            fullName: Joi.string().required(),
            fin: Joi.string().required(),
            mobilePhone: Joi.string()
                .min(10)
                .max(10)
                .required(),
            address: Joi.string().required(),
            orderedProductOption: Joi.object({
                _id: Joi.string(),
                selectedCampaigns: Joi.array()
                    .items(Joi.string())
                    .optional(),
                selectedLoan: Joi.string().optional(),
            })
                .allow(null)
                .optional(),
            orderedNumber: Joi.string()
                .when('orderedProductOption', {
                    is: Joi.exist(),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .allow(''),
        },
        { allowUnknown: true }
    );
    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }

    return null;
};

module.exports = {
    validateLoanRequest,
};
