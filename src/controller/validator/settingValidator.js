const Joi = require('joi');

const validateSetting = body => {
  if (!body) {
    return 'Invalid request';
  }
  const { error } = Joi.validate(
    body,
    {
      androidVersion: Joi.string().required(),
      iosVersion: Joi.string().required(),
      changelog: Joi.string().max(256),
      required: Joi.boolean()
    }
  )

  if (error) {
    return error.details && error.details.length ? error.details[0].message : 'Invalid request';
  }
  return null;
}

const validateSettingUpdate = body => {
  if (!body) {
    return 'Invalid request';
  }
  const { error } = Joi.validate(
    body,
    {
      androidVersion: Joi.string(),
      iosVersion: Joi.string(),
      changelog: Joi.string().max(256),
      required: Joi.boolean()
    }
  )

  if (error) {
    return error.details && error.details.length ? error.details[0].message : 'Invalid request';
  }
  return null;
}

module.exports = {
  validateSetting,
  validateSettingUpdate
}