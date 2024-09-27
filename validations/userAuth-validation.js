const Joi = require('joi');

exports.loginUserSchema = Joi.object({
    phonenumber: Joi.string().required().label('Phone number'),
});


exports.signupUserSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required().label('First Name'),
    lastName: Joi.string().min(2).max(50).required().label('Last Name'),
    // phoneNumber: Joi.string().regex(/^[0-9]{10,15}$/).required().label('Phone Number'), // Should be a valid phone number format
    phoneNumber: Joi.number().integer().min(1000000000).max(999999999999999).required().label('Phone Number'), // Should be a valid number with 10 to 15 digits
    NICnumber: Joi.string().min(9).max(12).required().label('NIC Number') // Adjust to your country's NIC format
});

exports.updatePhoneNumberSchema = Joi.object({
    //newPhoneNumber: Joi.string().required().label('New Phone Number'), // New phone number must be provided
    newPhoneNumber: Joi.number().integer().min(1000000000).max(999999999999999).required().label('New Phone Number'),
});