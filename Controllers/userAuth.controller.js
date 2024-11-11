const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const asyncHandler = require("express-async-handler");
const {
  signUpSchema,
  loginSchema,
  updatePhoneNumberSchema,
  updateFirstLastNameSchema,
  signupCheckerSchema,
} = require("../validations/userAuth-validation");

//sign up controller
const SignUp = asyncHandler(async(req, res) => {
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
                    message: "This mobile number exists in the database, please try another number!",
                });
            }

            const insertQuery =
                "INSERT INTO users(`firstName`, `lastName`, `phoneNumber`, `NICnumber`) VALUES(?, ?, ?, ?)";
            db.query(
                insertQuery, [firstName, lastName, formattedPhoneNumber, NICnumber],
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
     const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
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

        const token = jwt.sign({ id: user.id, phoneNumber: user.phoneNumber },
            process.env.JWT_SECRET, {
                expiresIn: "8h",
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

const signupChecker = asyncHandler(async(req, res) => {
    try {
        const { phoneNumber, NICnumber } = req.body;

        if (!phoneNumber && !NICnumber) {
            return res
                .status(400)
                .json({
                    message: "Please provide at least one of phoneNumber or NICnumber!",
                });
        }

        let conditions = [];
        let params = [];

        // Check if phoneNumber is provided
        if (phoneNumber) {
            const formattedPhoneNumber = `+${String(phoneNumber).replace(/^\+/, "")}`;
            conditions.push("phoneNumber = ?");
            params.push(formattedPhoneNumber);
        }

        // Check if NICnumber is provided
        if (NICnumber) {
            conditions.push("NICnumber = ?");
            params.push(NICnumber);
        }

        // Construct query
        const checkQuery = `SELECT * FROM users WHERE ${conditions.join(" OR ")}`;

        db.query(checkQuery, params, (err, results) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({
                    message: "An error occurred while checking the data.",
                });
            }

            // Prepare the response message
            let phoneNumberExists = false;
            let NICnumberExists = false;

            // If any matching record is found, check which field(s) exist
            results.forEach((user) => {
                if (user.phoneNumber === params[0]) {
                    phoneNumberExists = true;
                }
                if (user.NICnumber === params[1]) {
                    NICnumberExists = true;
                }
            });

            // Construct appropriate message
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

            // If no matching record is found, send success message
            res.status(200).json({ message: "Both fields are available!" });
        });
    } catch (err) {
        console.error("Error in signupChecker:", err);
        res.status(500).json({ message: "Internal Server Error!" });
    }
});


const updateFirstLastName = (req, res) => {
  const userId = req.user.id; // Extract userId from token
  const { firstName, lastName } = req.body; // Extract firstName and lastName from request body

  // Check if both firstName and lastName are provided
  if (!firstName || !lastName) {
    return res.status(400).json({
      status: "error",
      message: "Both first name and last name are required",
    });
  }

  // SQL query to update firstName and lastName based on user ID
  const sql = "UPDATE users SET firstName = ?, lastName = ? WHERE id = ?";
  db.query(sql, [firstName, lastName, userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Database error: " + err,
      });
    }

    // If no rows were affected, the user was not found
    if (results.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Successful update
    return res.status(200).json({
      status: "success",
      message: "First and last name updated successfully",
    });
  });
};




module.exports = {
  loginController,
  getProfileDetails,
  updatePhoneNumber,
  updateFirstLastName,
  signupChecker,
  SignUp,
};
