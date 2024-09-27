const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const asyncHandler = require("express-async-handler");

//sign up controller
const SignUp = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, NICnumber } = req.body;

    if (!firstName || !lastName || !phoneNumber || !NICnumber) {
      return res.status(400).json({ message: "Please fill all input fields!" });
    }

    // Ensure phoneNumber is a string and format it with "+" sign
    const formattedPhoneNumber = `+${String(phoneNumber).replace(/^\+/, "")}`;

    const checkQuery = "SELECT * FROM users WHERE phoneNumber = ?";
    db.query(checkQuery, [formattedPhoneNumber], (err, checkResult) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({
          message: "An error occurred while checking the phone number.",
        });
      }

      if (checkResult.length > 0) {
        return res.status(400).json({
          message:
            "This mobile number exists in the database, please try another number!",
        });
      }

      const insertQuery =
        "INSERT INTO users(`firstName`, `lastName`, `phoneNumber`, `NICnumber`) VALUES(?, ?, ?, ?)";
      db.query(
        insertQuery,
        [firstName, lastName, formattedPhoneNumber, NICnumber],
        (err, results) => {
          if (err) {
            console.error("Error executing query:", err);
            return res
              .status(500)
              .json({ message: "An error occurred while saving user data." });
          }

          res
            .status(200)
            .json({ message: "User registered successfully!", results });
        }
      );
    });
  } catch (err) {
    console.error("Error in SignUp:", err);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

// Login Controller
const loginController = (req, res) => {
  const phoneNumber = req.body.phonenumber;
  console.log(phoneNumber);

  if (!phoneNumber) {
    return res.status(400).json({
      status: "error",
      message: "Phone number is required",
    });
  }

  const sql = "SELECT * FROM users WHERE phoneNumber = ? LIMIT 1";
  db.query(sql, [phoneNumber], (err, results) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Database error: " + err,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const user = results[0];
    console.log("hi user id", user.id);
    console.log("hi user phno", user.phoneNumber);

    const token = jwt.sign(
      { id: user.id, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token: token,
    });
  });
};

// Get Profile Details Controller
const getProfileDetails = (req, res) => {
  const userId = req.user.id; // Extract userId from token

  const sql =
    "SELECT firstName, lastName, phoneNumber, NICnumber FROM users WHERE id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Database error: " + err,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const user = results[0];
    return res.status(200).json({
      status: "success",
      user: user,
    });
  });
};

// Update Phone Number Controller
const updatePhoneNumber = (req, res) => {
  const userId = req.user.id; // Extract userId from token
  const { newPhoneNumber } = req.body; // New phone number from request body

  if (!newPhoneNumber) {
    return res.status(400).json({
      status: "error",
      message: "New phone number is required",
    });
  }

  const sql = "UPDATE users SET phoneNumber = ? WHERE id = ?";
  db.query(sql, [newPhoneNumber, userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Database error: " + err,
      });
    }

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
};

module.exports = {
  loginController,
  getProfileDetails,
  updatePhoneNumber,
  SignUp,
};
