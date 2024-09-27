const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const asyncHandler = require("express-async-handler");
// const {loginUserSchema} =require('../validations/userAuth-validation')
//const loginUserSchema=require('../validations/userAuth-validation')
const {
  loginUserSchema,
  signupUserSchema,
  updatePhoneNumberSchema,
} = require("../validations/UserAuth-validation");
//const { updatePhoneNumberSchema } = require('../validations/userAuth-validation');
const userAuthDao = require("../dao/userAuth-dao");
const userProfileDao = require("../dao/userAuth-dao");

exports.loginUser = async (req, res) => {
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
    const token = jwt.sign(
      { id: user.id, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET || Tl,
      {
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

exports.SignupUser = asyncHandler(async (req, res) => {
  try {
    // Validate the request body using Joi schema
    await signupUserSchema.validateAsync(req.body);

    const { firstName, lastName, phoneNumber, NICnumber } = req.body;

    // Format phone number to ensure "+" is added at the start, if not present
    const formattedPhoneNumber = `+${String(phoneNumber).replace(/^\+/, "")}`;

    // Check if the phone number already exists in the database
    const existingUser = await userAuthDao.checkUserByPhoneNumber(
      formattedPhoneNumber
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message:
          "This mobile number exists in the database, please try another number!",
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

exports.getProfileDetails = asyncHandler(async (req, res) => {
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

exports.updatePhoneNumber = asyncHandler(async (req, res) => {
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
