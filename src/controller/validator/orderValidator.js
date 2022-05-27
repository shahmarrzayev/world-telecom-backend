const Joi = require('joi');

const { OrderStatus, PaymentType } = require('../../enums');

const validateModifyOrder = body => {
    if (!body) {
        return 'Invalid request';
    }
    const { error } = Joi.validate(body, {
        orderStatus: Joi.string()
            .valid(Object.values(OrderStatus))
            .required(),
    });
    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }
    return null;
};

const validateRegisterOrder = body => {
    if (!body) {
        return 'Invalid request';
    }

    const { error } = Joi.validate(
        body,
        {
            name: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string()
                .email()
                .allow(null, '')
                .optional(),
            mobilePhone: Joi.string()
                .min(10)
                .max(10)
                .required(),
            paymentType: Joi.string()
                .valid(Object.values(PaymentType))
                .required(),
            orderedProductOptions: Joi.array()
                .items(
                    Joi.object({
                        _id: Joi.string(),
                        count: Joi.number().optional(),
                        selectedCampaigns: Joi.array()
                            .items(Joi.string())
                            .optional(),
                    })
                )
                .allow(null, [])
                .optional(),
            orderedNumbers: Joi.array()
                .items(
                    Joi.object({
                        _id: Joi.string(),
                        selectedCampaigns: Joi.array()
                            .items(Joi.string())
                            .optional(),
                    })
                )
                .allow(null, [])
                .when('orderedProductOptions', {
                    is: Joi.exist(),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                }),
            installmentPeriod: Joi.number()
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
    validateModifyOrder,
    validateRegisterOrder,
};
