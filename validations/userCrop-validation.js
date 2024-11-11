const Joi = require("joi");

// Validation schema for getting crop by category
exports.getCropByCategorySchema = Joi.object({
  categorie: Joi.string().required().label("Category"),
});

// Validator to ensure cropId is a number and is required
exports.getCropByIdSchema = Joi.object({
  id: Joi.number().required().label("Crop ID"),
});

// Validate cropId from URL parameters
exports.cropCalendarFeedSchema = Joi.object({
  cropid: Joi.string().required().messages({
    "string.base": `"Crop ID" should be a type of 'text'`,
    "string.empty": `"Crop ID" cannot be an empty field`,
    "any.required": `"Crop ID" is required`,
  }),
});

// You can use this if you need to validate query parameters, such as pagination.
exports.ongoingCultivationSchema = Joi.object({
  limit: Joi.number().optional(), // For pagination, optional
  offset: Joi.number().optional(), // For pagination, optional
});

exports.enrollSchema = Joi.object({
  cropId: Joi.string().required().messages({
    "string.base": `"Crop ID" should be a string`,
    "string.empty": `"Crop ID" cannot be an empty field`,
    "any.required": `"Crop ID" is required`,
  }),
});

exports.getSlaveCropCalendarDaysSchema = Joi.object({
  cropCalendarId: Joi.string().required().label("Crop Calendar ID"),
});

exports.updateCropCalendarStatusSchema = Joi.object({
  id: Joi.number().required().label("Task ID"),
  status: Joi.string().valid("pending", "completed").required().label("Status"),
});

// module.exports = {
//   ongoingCultivationSchema,
// };
