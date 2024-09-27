const Joi = require("joi");

// Validator for the getAllMarket endpoint, in case any future query params are added
exports.getAllMarketSchema = Joi.object({});
