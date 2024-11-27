const Joi = require('joi');

// Login Schema
exports.loginUserSchema = Joi.object({
    phonenumber: Joi.string()
        .pattern(/^\+?\d{10,15}$/)
        .required()
        .label('Phone number')
        .messages({
            "string.pattern.base": "Phone number must be a valid format with 10-15 digits."
        }),
});

// Sign Up Schema
exports.signupUserSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required().label('First Name'),
    lastName: Joi.string().min(2).max(50).required().label('Last Name'),
    phoneNumber: Joi.number().required().label('Mobile Number'),
    NICnumber: Joi.string()
        .min(9)
        .max(12)
        .required()
        .label('NIC Number')
        .messages({
            "string.min": "NIC Number must be at least 9 characters.",
            "string.max": "NIC Number must be no more than 12 characters."
        }),
    district: Joi.string().required().label('District'),
});

// Update Phone Number Schema
exports.updatePhoneNumberSchema = Joi.object({
    newPhoneNumber: Joi.string()
        .pattern(/^\+?\d{10,15}$/)
        .required()
        .label('New Phone Number')
        .messages({
            "string.pattern.base": "New phone number must be a valid format with 10-15 digits."
        }),
});

// Sign Up Checker Schema
exports.signupCheckerSchema = Joi.object({
        phoneNumber: Joi.string()
            .pattern(/^\+?\d{10,15}$/)
            .optional()
            .label('Phone Number')
            .messages({
                "string.pattern.base": "Phone number must be a valid format with 10-15 digits."
            }),
        NICnumber: Joi.string()
            .optional()
            .label('NIC Number'),
    }).or('phoneNumber', 'NICnumber')
    .label('Request Data')
    .messages({
        "object.missing": "Please provide at least one of phoneNumber or NICnumber."
    });

// Update First and Last Name Schema
exports.updateFirstLastNameSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required().label('First Name'),
    lastName: Joi.string().min(2).max(50).required().label('Last Name')
});