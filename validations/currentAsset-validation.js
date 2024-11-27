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
    //volume: Joi.string().required().label("Volume"),
});


exports.addFixedAssetSchema = Joi.object({
    category: Joi.string().required().label('Category'),
    asset: Joi.string().required().label('Asset'),
    brand: Joi.string().optional().label('Brand'),
    batchNum: Joi.string().optional().label('Batch Number'),
    volume: Joi.number().positive().required(), // Ensure volume is a number
    unit: Joi.string().required().label('Unit'),
    numberOfUnits: Joi.number().integer().required().label('Number of Units'),
    unitPrice: Joi.number().precision(2).required().label('Unit Price'),
    totalPrice: Joi.number().precision(2).required().label('Total Price').custom((value, helpers) => {
        console.log('Total Price:', value);
        return value;
    }),

    purchaseDate: Joi.date().required().label('Purchase Date'),
    expireDate: Joi.date().optional().label('Expire Date'),
    warranty: Joi.string().optional().label('Warranty'),
    status: Joi.string().optional().label('Status')
});