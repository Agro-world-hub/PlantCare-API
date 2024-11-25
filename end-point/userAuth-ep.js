const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const asyncHandler = require("express-async-handler");
const userBankDetailsDAO = require('../dao/userAuth-dao');
// const {loginUserSchema} =require('../validations/userAuth-validation')
//const loginUserSchema=require('../validations/userAuth-validation')
const {
    loginUserSchema,
    signupUserSchema,
    updatePhoneNumberSchema,
    signupCheckerSchema,
    updateFirstLastNameSchema
} = require("../validations/userAuth-validation");
//const { updatePhoneNumberSchema } = require('../validations/userAuth-validation');
const userAuthDao = require("../dao/userAuth-dao");
const userProfileDao = require("../dao/userAuth-dao");
const signupDao = require('../dao/userAuth-dao');

exports.loginUser = async(req, res) => {
    try {
        console.log("hi..the sec key is", process.env.JWT_SECRET);
        await loginUserSchema.validateAsync(req.body);

        const phonenumber = req.body.phonenumber;
        console.log("hi phonenumber", phonenumber);

        const users = await userAuthDao.loginUser(phonenumber);

        if (!users || users.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        const user = users[0]; // Access the first user in the array

        // Generate JWT token
        const token = jwt.sign({ id: user.id, phoneNumber: user.phoneNumber },
            process.env.JWT_SECRET || Tl, {
                expiresIn: "1h",
            }
        );

        // Return success response
        res.status(200).json({
            status: "success",
            message: "Login successful",
            token,
        });
    } catch (err) {
        console.error("hi.... Error:", err);
        if (err.isJoi) {
            // Validation error
            return res.status(400).json({
                status: "error",
                message: err.details[0].message,
            });
        }
        // Other errors
        res
            .status(500)
            .json({ status: "error", message: "An error occurred during login." });
    }
};

exports.SignupUser = asyncHandler(async(req, res) => {
    try {
        // Validate the request body using Joi schema
        // await signupUserSchema.validateAsync(req.body);
        const { firstName, lastName, phoneNumber, NICnumber } = req.body;
        // Format phone number to ensure "+" is added at the start, if not present
        const formattedPhoneNumber = `+${String(phoneNumber).replace(/^\+/, "")}`;

        // Check if the phone number already exists in the database
        const existingUser = await userAuthDao.checkUserByPhoneNumber(
            formattedPhoneNumber
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                message: "This mobile number exists in the database, please try another number!",
            });
        }

        // Insert the new user into the database
        const result = await userAuthDao.insertUser(
            firstName,
            lastName,
            formattedPhoneNumber,
            NICnumber
        );

        // Send success response if user is registered successfully
        res.status(200).json({ message: "User registered successfully!", result });
    } catch (err) {
        console.error("Error in SignUp:", err);
        if (err.isJoi) {
            // Validation error
            return res.status(400).json({ message: err.details[0].message });
        }
        // Other errors
        res.status(500).json({ message: "Internal Server Error!" });
    }
});




exports.getProfileDetails = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id; // Extract userId from the token
        console.log("hi..Fetching profile for userId:", userId);

        // Retrieve user profile from the database using the DAO function
        const user = await userProfileDao.getUserProfileById(userId);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        // Respond with user details
        res.status(200).json({
            status: "success",
            user: user,
        });
    } catch (err) {
        // Handle any errors that occur during the process
        console.error("Error fetching profile details:", err);
        res.status(500).json({
            status: "error",
            message: "An error occurred while fetching profile details.",
        });
    }
});

exports.updatePhoneNumber = asyncHandler(async(req, res) => {
    const userId = req.user.id; // Extract userId from token
    const { newPhoneNumber } = req.body; // New phone number from request body

    // Validate the request body
    await updatePhoneNumberSchema.validateAsync(req.body);

    // Call the DAO to update the phone number
    const results = await userAuthDao.updateUserPhoneNumber(
        userId,
        newPhoneNumber
    );

    // Check if the update was successful
    if (results.affectedRows === 0) {
        return res.status(404).json({
            status: "error",
            message: "User not found",
        });
    }

    // Respond with success message
    return res.status(200).json({
        status: "success",
        message: "Phone number updated successfully",
    });
});


exports.signupChecker = asyncHandler(async(req, res) => {
    try {
        // Validate the request body
        await signupCheckerSchema.validateAsync(req.body);

        const { phoneNumber, NICnumber } = req.body;

        // Call the DAO to check if the details exist in the database
        const results = await signupDao.checkSignupDetails(phoneNumber, NICnumber);

        let phoneNumberExists = false;
        let NICnumberExists = false;

        // Iterate over the results to determine existence of each field
        results.forEach((user) => {
            if (user.phoneNumber === `+${String(phoneNumber).replace(/^\+/, "")}`) {
                phoneNumberExists = true;
            }
            if (user.NICnumber === NICnumber) {
                NICnumberExists = true;
            }
        });

        // Respond based on the existence of the data
        if (phoneNumberExists && NICnumberExists) {
            return res.status(200).json({ message: "This Phone Number and NIC already exist." });
        } else if (phoneNumberExists) {
            return res.status(200).json({ message: "This Phone Number already exists." });
        } else if (NICnumberExists) {
            return res.status(200).json({ message: "This NIC already exists." });
        }

        // If no matching records were found, return a success message
        res.status(200).json({ message: "Both fields are available!" });

    } catch (err) {
        console.error("Error in signupChecker:", err);

        if (err.isJoi) {
            return res.status(400).json({
                status: 'error',
                message: err.details[0].message,
            });
        }

        res.status(500).json({ message: "Internal Server Error!" });
    }
});


exports.updateFirstLastName = asyncHandler(async(req, res) => {
    try {
        // Validate the request body
        const { firstName, lastName } = await updateFirstLastNameSchema.validateAsync(req.body);
        const userId = req.user.id;

        // Update first and last name using DAO
        const affectedRows = await userAuthDao.updateFirstLastName(userId, firstName, lastName);

        // If no rows were affected, return user not found error
        if (affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Successful update
        return res.status(200).json({
            status: 'success',
            message: 'First and last name updated successfully'
        });
    } catch (err) {
        console.error("Error updating first and last name:", err);

        if (err.isJoi) {
            return res.status(400).json({
                status: 'error',
                message: err.details[0].message,
            });
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
});



// Function to register bank details and generate QR code

// Function to wrap query execution into a promise
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

const dbService = require('../dao/userAuth-dao');
// Import the updateQRCode function
// In the controller:
exports.registerBankDetails = (req, res) => {
    const {
        firstName,
        lastName,
        nic,
        mobileNumber,
        selectedDistrict,
        accountNumber,
        accountHolderName,
        bankName,
        branchName,
    } = req.body;

    const userId = req.user.id;
    console.log(req.body);

    // Start a database transaction
    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to start transaction', error: err.message });
        }

        // Insert bank details into 'userbankdetails' table
        dbService.insertBankDetails(userId, selectedDistrict, accountNumber, accountHolderName, bankName, branchName, (insertErr, insertResult) => {
            if (insertErr) {
                return db.rollback(() => {
                    console.error('Error inserting bank details:', insertErr);
                    return res.status(500).json({ message: 'Failed to insert bank details', error: insertErr.message });
                });
            }

            // Prepare QR code data as a JSON object
            const qrData = {
                userInfo: {
                    id: userId,
                    name: `${firstName || 'Not provided'} ${lastName || 'Not provided'}`,
                    nic: nic || 'Not provided',
                    phone: mobileNumber || 'Not provided',
                },
                bankInfo: {
                    accountHolder: accountHolderName || 'Not provided',
                    accountNumber: accountNumber || 'Not provided',
                    bank: bankName || 'Not provided',
                    branch: branchName || 'Not provided',
                }
            };

            console.log(qrData)

            // Directly use the JSON object for generating the QR code
            dbService.generateQRCode(JSON.stringify(qrData), (qrCodeErr, qrCodeImage) => {
                if (qrCodeErr) {
                    return db.rollback(() => {
                        console.error('Error generating QR code:', qrCodeErr);
                        return res.status(500).json({ message: 'Failed to generate QR code', error: qrCodeErr.message });
                    });
                }

                // Update user's QR code in the 'users' table
                dbService.updateQRCode(userId, qrCodeImage, (updateErr, updateResult) => {
                    if (updateErr) {
                        return db.rollback(() => {
                            console.error('Error updating QR code:', updateErr);
                            return res.status(500).json({ message: 'Failed to update QR code', error: updateErr.message });
                        });
                    }

                    // Commit the transaction if everything is successful
                    db.commit((commitErr) => {
                        if (commitErr) {
                            return db.rollback(() => {
                                console.error('Error committing transaction:', commitErr);
                                return res.status(500).json({ message: 'Transaction commit failed', error: commitErr.message });
                            });
                        }

                        // Success response with JSON object
                        res.status(200).json({
                            message: 'Bank details registered and QR code generated successfully',
                            qrData: qrData // Returning the JSON object as part of the response
                        });
                    });
                });
            });
        });
    });
};