const Joi = require('joi');

const validateCreateSeoPage = seoPage => {
  if (!seoPage) {
    return 'Invalid request';
  }

  const { error } = Joi.validate(seoPage, {
    title: Joi.string()
      .min(4)
      .max(256)
      .required(),
    description: Joi.string()
      .allow("")
      .max(64000),
    tag: Joi.string()
      .min(4)
      .max(256)
      .required(),
    meta_title: Joi.string()
      .max(300)
      .optional(),
    meta_description: Joi.string()
      .max(300)
      .optional()
  })

  if (error) {
    return error.details && error.details.length ? error.details[0].message : 'Invalid request';
  }
  return null;
}


const validateUpdateSeoPage = seoPage => {
  if (!seoPage) {
    return 'Invalid request';
  }

  const { error } = Joi.validate(seoPage, {
    title: Joi.string()
      .min(4)
      .max(256),
    description: Joi.string()
      .allow("")
      .max(64000),
    tag: Joi.string()
      .min(4)
      .max(256),
    meta_title: Joi.string()
      .max(300)
      .optional(),
    meta_description: Joi.string()
      .max(300)
      .optional()
  })

  if (error) {
    return error.details && error.details.length ? error.details[0].message : 'Invalid request';
  }

  return null;
}

module.exports = {
  validateCreateSeoPage,
  validateUpdateSeoPage
}