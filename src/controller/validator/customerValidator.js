const Joi = require('joi');

const { Gender, IdType } = require('../../enums');
const { isValidDate } = require('../../utils/commonUtils');

const validateAddAddress = address => {
    if (!address) return 'Invalid request';

    const { error } = Joi.validate(address, {
        _id: Joi.string()
            .optional()
            .allow(null, ''),
        street: Joi.string().required(),
        houseNumber: Joi.string().required(),
        city: Joi.string().required(),
        district: Joi.string()
            .optional()
            .allow(null, ''),
    });

    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }

    return null;
};

const validateChangePassword = body => {
    if (!body) return 'Invalid request';

    const { error } = Joi.validate(body, {
        currentPass: Joi.string().required(),
        newPass: Joi.string().required(),
    });

    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }

    return null;
};

const validateSaveCustomer = user => {
    if (!user) {
        return 'Invalid request';
    }

    const { error } = Joi.validate(user, {
        firstName: Joi.string()
            .min(1)
            .max(256)
            .required(),
        lastName: Joi.string()
            .min(1)
            .max(256)
            .required(),
        email: Joi.string()
            .email()
            .required(),
        password: Joi.string()
            .optional()
            .required(),
        mobilePhone: Joi.string()
            .min(10)
            .max(10)
            .required(),
        gender: Joi.string()
            .valid(Object.values(Gender))
            .required(),
        birthDate: Joi.string()
            .optional()
            .allow(null, ''),
        idType: Joi.string()
            .valid(Object.values(IdType))
            .optional()
            .allow(null, ''),
        serialNumber: Joi.string()
            .optional()
            .allow(null, ''),
        finCode: Joi.string()
            .optional()
            .allow(null, ''),
    });

    if (error || (user.birthDate && !isValidDate(user.birthDate))) {
        return error && error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }

    return null;
};

const validateUpdateCustomer = body => {
    if (!body) {
        return 'Invalid request';
    }

    const { error } = Joi.validate(body, {
        firstName: Joi.string()
            .min(1)
            .max(256),
        lastName: Joi.string()
            .min(1)
            .max(256),
        email: Joi.string().email(),
        mobilePhone: Joi.string()
            .min(10)
            .max(10),
        gender: Joi.string().valid(Object.values(Gender)),
        birthDate: Joi.string()
            .optional()
            .allow(null, ''),
        idType: Joi.string()
            .valid(Object.values(IdType))
            .optional()
            .allow(null, ''),
        serialNumber: Joi.string()
            .optional()
            .allow(null, ''),
        finCode: Joi.string()
            .optional()
            .allow(null, ''),
    });

    if (error || (body.birthDate && !isValidDate(body.birthDate))) {
        return error && error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }
    return null;
};

module.exports = {
    validateAddAddress,
    validateChangePassword,
    validateSaveCustomer,
    validateUpdateCustomer,
};
