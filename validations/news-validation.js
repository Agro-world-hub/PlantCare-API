const Joi = require('joi');

// Validator for the getAllNews endpoint (in case of future query params)
exports.getAllNewsSchema = Joi.object({});

exports.getNewsByIdSchema = Joi.object({
    newsId: Joi.string().required().messages({
      'string.base': `"News ID" should be a type of 'text'`,
      'string.empty': `"News ID" cannot be an empty field`,
      'any.required': `"News ID" is required`
    }),
  });



