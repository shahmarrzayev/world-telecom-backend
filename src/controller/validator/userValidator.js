const Joi = require('joi');

const { MaritalStatus } = require('../../enums');

const validateAddProductToCart = productInfo => {
    if (!productInfo) {
        return 'Invalid request';
    }
    const { error } = Joi.validate(productInfo, {
        count: Joi.number().min(1),
        productId: Joi.string().required(),
    });
    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }
    return null;
};

const validateAddUser = user => {
    if (!user) {
        return 'Invalid request';
    }
    const { error } = Joi.validate(user, {
        email: Joi.string()
            .email()
            .required(),
        password: Joi.string().required(),
        firstName: Joi.string()
            .min(1)
            .max(256)
            .required(),
        lastName: Joi.string()
            .min(1)
            .max(256)
            .required(),
        maritalStatus: Joi.string().valid(Object.values(MaritalStatus)),
        nationalId: Joi.string()
            .min(7)
            .max(7),
        patronymic: Joi.string()
            .min(1)
            .max(256),
        phoneNumber: Joi.string()
            .min(12)
            .max(12),
    });
    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }
    return null;
};

const validateChangePassword = (oldPassword, newPassword) => {
    if (!oldPassword || !newPassword) {
        return 'Invalid request';
    }
    return null;
};

module.exports = {
    validateAddProductToCart,
    validateAddUser,
    validateChangePassword,
};
