const Joi = require('joi');

const createFarm = Joi.object({
    // User ID added by middleware
    userId: Joi.number().required(),

    // Basic farm details
    farmName: Joi.string().required(),
    farmIndex: Joi.number().optional().default(1), // Uncommented this line
    farmImage: Joi.number().optional().default(1),

    // Extent details
    extentha: Joi.string().required(),
    extentac: Joi.string().required(),
    extentp: Joi.string().required(),

    // Location details
    district: Joi.string().required(),
    plotNo: Joi.string().required(),
    street: Joi.string().required(),
    city: Joi.string().required(),

    // Staff details
    staffCount: Joi.string().required(),
    appUserCount: Joi.string().required(),

    // Staff array
    staff: Joi.array()
        .items(
            Joi.object({
                id: Joi.number().optional(),
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                phoneCode: Joi.string().required(),
                phoneNumber: Joi.string().required(),
                role: Joi.string().required(),
                image: Joi.string().allow(null).optional(),
            })
        )
        .required(),
});

const createPayment = Joi.object({
    userId: Joi.number().integer().positive().required(),
    payment: Joi.number().positive().required(),
    plan: Joi.string().valid('1month', '3months', '6months', '12months').required(),
    expireDate: Joi.date().iso().required(),
    activeStatus: Joi.number().valid(0, 1).default(1)
});

// Export both schemas in a single module.exports
module.exports = {
    createFarm,
    createPayment
};