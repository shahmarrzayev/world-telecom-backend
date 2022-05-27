const Joi = require('joi');

const validateSaveDeviceInfo = deviceInfo => {
    if (!deviceInfo) return 'Invalid request';
    const { error } = Joi.validate(deviceInfo, {
        token: Joi.string().required(),
        model: Joi.string().required(),
        customerId: Joi.string()
            .optional()
            .allow(null, ''),
        browserId: Joi.string()
            .optional()
            .allow(null, ''),
    });
    if (error) {
        return error.details && error.details.length ? error.details[0].message : 'Invalid request';
    }
    return null;
};

module.exports = {
    validateSaveDeviceInfo,
};
