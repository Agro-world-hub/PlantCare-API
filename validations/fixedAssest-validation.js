// validators/fixedAssets-validation.js
const Joi = require("joi");

// Validation schema for fetching fixed assets by category and user
exports.fixedAssetsSchema = Joi.object({
  category: Joi.string().required().label("Category"),
});

// Validation schema for deleting fixed assets
exports.deleteFixedAssetSchema = Joi.object({
  ids: Joi.alternatives()
    .try(
      Joi.array().items(Joi.number().integer().required()),
      Joi.number().integer()
    )
    .required()
    .label("IDs"),
});



// Validation schema for addfixedasset

