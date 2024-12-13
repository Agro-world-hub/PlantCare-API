const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const asyncHandler = require("express-async-handler");
const userAuthDao = require("../dao/userAuth-dao");
const userProfileDao = require("../dao/userAuth-dao");
const signupDao = require('../dao/userAuth-dao');
const ValidationSchema = require('../validations/userAuth-validation')

exports.loginUser = async(req, res) => {
    try {
        console.log("hi..the sec key is", process.env.JWT_SECRET);
        const { phonenumber } = await ValidationSchema.loginUserSchema.validateAsync(req.body);

        console.log("hi phonenumber", phonenumber);

        const users = await userAuthDao.loginUser(phonenumber);

        if (!users || users.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        const user = users[0];

        const token = jwt.sign({ id: user.id, phoneNumber: user.phoneNumber },
            process.env.JWT_SECRET || Tl, {
                expiresIn: "8h",
            }
        );

        res.status(200).json({
            status: "success",
            message: "Login successful",
            token,
        });
    } catch (err) {
        console.error("hi.... Error:", err);
        if (err.isJoi) {
            return res.status(400).json({
                status: "error",
                message: err.details[0].message,
            });
        }
        res
            .status(500)
            .json({ status: "error", message: "An error occurred during login." });
    }
};


exports.SignupUser = asyncHandler(async(req, res) => {
    try {
        const { firstName, lastName, phoneNumber, NICnumber, district } =
        await ValidationSchema.signupUserSchema.validateAsync(req.body);

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

        const result = await userAuthDao.insertUser(
            firstName,
            lastName,
            formattedPhoneNumber,
            NICnumber,
            district
        );

        const payload = {
            id: result.insertId,
            phoneNumber: formattedPhoneNumber,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });

        res.status(200).json({
            message: "User registered successfully!",
            result,
            token,
        });
    } catch (err) {
        console.error("Error in SignUp:", err);
        if (err.isJoi) {
            return res.status(400).json({ message: err.details[0].message });
        }
        res.status(500).json({ message: "Internal Server Error!" });
    }
});

exports.getProfileDetails = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id;
        console.log("hi..Fetching profile for userId:", userId);

        // Retrieve user profile from the database using the DAO function
        const user = await userProfileDao.getUserProfileById(userId);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        res.status(200).json({
            status: "success",
            user: user,
        });
    } catch (err) {
        console.error("Error fetching profile details:", err);
        res.status(500).json({
            status: "error",
            message: "An error occurred while fetching profile details.",
        });
    }
});

exports.updatePhoneNumber = asyncHandler(async(req, res) => {
    const userId = req.user.id;

    // Validate the request body
    await updatePhoneNumberSchema.validateAsync(req.body);

    const results = await userAuthDao.updateUserPhoneNumber(
        userId,
        newPhoneNumber
    );

    if (results.affectedRows === 0) {
        return res.status(404).json({
            status: "error",
            message: "User not found",
        });
    }

    return res.status(200).json({
        status: "success",
        message: "Phone number updated successfully",
    });
});

exports.signupChecker = asyncHandler(async(req, res) => {
    try {
        const { phoneNumber, NICnumber } =
        await ValidationSchema.signupCheckerSchema.validateAsync(req.body);

        const results = await signupDao.checkSignupDetails(phoneNumber, NICnumber);

        let phoneNumberExists = false;
        let NICnumberExists = false;

        results.forEach((user) => {
            if (user.phoneNumber === `+${String(phoneNumber).replace(/^\+/, "")}`) {
                phoneNumberExists = true;
            }
            if (user.NICnumber === NICnumber) {
                NICnumberExists = true;
            }
        });

        if (phoneNumberExists && NICnumberExists) {
            return res
                .status(200)
                .json({ message: "This Phone Number and NIC already exist." });
        } else if (phoneNumberExists) {
            return res
                .status(200)
                .json({ message: "This Phone Number already exists." });
        } else if (NICnumberExists) {
            return res.status(200).json({ message: "This NIC already exists." });
        }

        res.status(200).json({ message: "Both fields are available!" });
    } catch (err) {
        console.error("Error in signupChecker:", err);

        if (err.isJoi) {
            return res.status(400).json({
                status: "error",
                message: err.details[0].message,
            });
        }

        res.status(500).json({ message: "Internal Server Error!" });
    }
});

exports.updateFirstLastName = asyncHandler(async(req, res) => {
    try {
        const { firstName, lastName, buidingname, streetname, city  } =
        await ValidationSchema.updateFirstLastNameSchema.validateAsync(req.body);
       

        const userId = req.user.id;

        const affectedRows = await userAuthDao.updateFirstLastName(
            userId,
            firstName,
            lastName,
            buidingname,
            streetname,
            city
        );
        console.log("hi..the affected rows is", affectedRows);

        if (affectedRows === 0) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "First and last name updated successfully",
        });
    } catch (err) {
        console.error("Error updating first and last name:", err);

        if (err.isJoi) {
            return res.status(400).json({
                status: "error",
                message: err.details[0].message,
            });
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
});

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

const dbService = require("../dao/userAuth-dao");
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
    console.log(userId);

    db.beginTransaction((err) => {
        if (err) {
            return res
                .status(500)
                .json({ message: "Failed to start transaction", error: err.message });
        }

        // Insert the bank details into the database
        dbService.insertBankDetails(
            userId,
            selectedDistrict,
            accountNumber,
            accountHolderName,
            bankName,
            branchName,
            (insertErr, insertResult) => {
                if (insertErr) {
                    return db.rollback(() => {
                        console.error("Error inserting bank details:", insertErr);
                        return res
                            .status(500)
                            .json({
                                message: "Failed to insert bank details",
                                error: insertErr.message,
                            });
                    });
                }

                // Commit the transaction after successfully inserting the bank details
                db.commit((commitErr) => {
                    if (commitErr) {
                        return db.rollback(() => {
                            console.error("Error committing transaction:", commitErr);
                            return res
                                .status(500)
                                .json({
                                    message: "Transaction commit failed",
                                    error: commitErr.message,
                                });
                        });
                    }

                    // Send response that bank details were registered successfully
                    res.status(200).json({
                        message: "Bank details registered successfully",
                        bankData: {
                            userId,
                            accountHolderName,
                            accountNumber,
                            bankName,
                            branchName,
                            selectedDistrict,
                        },
                    });
                });
            }
        );
    });
};





exports.updateAddress = async(req, res) => {
    try {
        // Use validateAsync to handle Joi validation asynchronously
        const { houseNo, streetName, city } = await ValidationSchema.updateAddressSchema.validateAsync(req.body);
        console.log(houseNo);
        console.log(streetName);
        console.log(city);

        const userId = req.user.id;

        // Update address and QR code
        dbService.updateAddressAndQRCode(userId, houseNo, streetName, city, (err, successMessage) => {
            if (err) {
                console.error("Error updating address and QR code:", err);
                return res.status(500).json({
                    message: "Error updating address and QR code",
                    error: err.message,
                });
            }

            res.status(200).json({ message: successMessage });
        });
    } catch (error) {
        console.error("Error:", error); // Log the full error
        if (error.isJoi) {
            return res.status(400).json({
                message: "Invalid input data",
                details: error.details.map((err) => err.message),
            });
        }
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


exports.checkAddressFields = async(req, res) => {
    try {
        const userId = req.user.id;

        // Use the DAO to check if the address fields are filled
        const address = await dbService.checkAddressFields(userId);

        if (!address) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const { houseNo, streetName, city } = address;

        // Check if any of the address fields are empty or NULL
        if (!houseNo || !streetName || !city) {
            return res.status(400).json({
                message: "No",
            });
        }

        // If all fields are filled
        return res.status(200).json({
            message: "Yes",
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};