// // validators/currentAssets-validation.js

// const Joi = require("joi");

// // Validation schema to ensure user ID exists in the request (if needed for future scenarios)
// exports.getAllCurrentAssetsSchema = Joi.object({
//   userId: Joi.number().integer().required().label("User ID"), // Ensure valid user ID
// });

// // validators/currentAssets-validation.js

// // Validation schema for the getAssetsByCategory API
// exports.getAssetsByCategorySchema = Joi.object({
//   category: Joi.alternatives()
//     .try(
//       Joi.string().label("Category"), // Single category
//       Joi.array().items(Joi.string().label("Category")) // Multiple categories
//     )
//     .required()
//     .label("Category"), // The category parameter is required
// });

// // Validation schema for deleting an asset
// exports.deleteAssetSchema = Joi.object({
//   numberOfUnits: Joi.number()
//     .integer()
//     .positive()
//     .required()
//     .label("Number of Units"), // Ensure it's a positive integer
//   totalPrice: Joi.number().positive().required().label("Total Price"), // Ensure it's a positive number
// });

// // Validation schema for request parameters
// exports.deleteAssetParamsSchema = Joi.object({
//   category: Joi.string().required().label("Category"), // Ensure category is a string
//   assetId: Joi.number().integer().required().label("Asset ID"), // Ensure assetId is a number
// });


// validators/currentAssets-validation.js

const Joi = require("joi");

// Validation schema to ensure user ID exists in the request (if needed for future scenarios)
exports.getAllCurrentAssetsSchema = Joi.object({
  userId: Joi.number().integer().required().label("User ID"), // Ensure valid user ID
});

// validators/currentAssets-validation.js

// Validation schema for the getAssetsByCategory API
exports.getAssetsByCategorySchema = Joi.object({
  category: Joi.alternatives()
    .try(
      Joi.string().label("Category"), // Single category
      Joi.array().items(Joi.string().label("Category")) // Multiple categories
    )
    .required()
    .label("Category"), // The category parameter is required
});

// Validation schema for deleting an asset
exports.deleteAssetSchema = Joi.object({
  numberOfUnits: Joi.number()
    .integer()
    .positive()
    .required()
    .label("Number of Units"), // Ensure it's a positive integer
  totalPrice: Joi.number().positive().required().label("Total Price"), // Ensure it's a positive number
});

// Validation schema for request parameters
exports.deleteAssetParamsSchema = Joi.object({
  category: Joi.string().required().label("Category"), // Ensure category is a string
  assetId: Joi.number().integer().required().label("Asset ID"), // Ensure assetId is a number
});

exports.addFixedAssetSchema = Joi.object({
  category: Joi.string().required().label("Category"),
  asset: Joi.string().required().label("Asset"),
  brand: Joi.string().required().label("Brand"),
  batchNum: Joi.string().required().label("Batch Number"),
  volume: Joi.number().integer().required().label("Volume"),
  unit: Joi.string().required().label("Unit"),
  numberOfUnits: Joi.number().integer().required().label("Number of Units"),
  unitPrice: Joi.number().required().label("Unit Price"),
  totalPrice: Joi.number().required().label("Total Price"),
  purchaseDate: Joi.date().required().label("Purchase Date"),
  expireDate: Joi.date().required().label("Expire Date"),
  status: Joi.string()
    .valid("Still Valid", "Expired")
    .required()
    .label("Status"),
  warranty: Joi.string().allow(null, "").label("Warranty"),
});
