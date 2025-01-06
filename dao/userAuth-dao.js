const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const asyncHandler = require("express-async-handler");
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

exports.loginUser = (phonenumber) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE phoneNumber = ? LIMIT 1";
        db.plantcare.query(sql, [phonenumber], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.checkUserByPhoneNumber = (phoneNumber) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM users WHERE phoneNumber = ?";
        db.plantcare.query(query, [phoneNumber], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.insertUser = (firstName, lastName, phoneNumber, NICnumber, district) => {
    return new Promise((resolve, reject) => {
        const query =
            "INSERT INTO users(`firstName`, `lastName`, `phoneNumber`, `NICnumber`, `district`) VALUES(?, ?, ?, ?,?)";
        db.plantcare.query(
            query, [firstName, lastName, phoneNumber, NICnumber, district],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            }
        );
    });
};

exports.getUserProfileById = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE id = ?";
        db.plantcare.query(sql, [userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length === 0) {
                return resolve(null);
            }
            const userProfile = results[0];

            // Decode the file path
            if (userProfile.farmerQr) {
                const filePath = Buffer.from(userProfile.farmerQr, 'base64').toString('utf-8');

                // Read the file and convert to Base64
                try {
                    const fullPath = path.join(__dirname, '..', filePath);
                    const imageBuffer = fs.readFileSync(fullPath);
                    userProfile.farmerQr = imageBuffer.toString('base64');
                } catch (error) {
                    console.error('Error reading QR code file:', error);
                    userProfile.farmerQr = null;
                }
            }

            resolve(userProfile);
        });
    });
};


exports.updateUserPhoneNumber = (userId, newPhoneNumber) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE users SET phoneNumber = ? WHERE id = ?";
        db.plantcare.query(sql, [newPhoneNumber, userId], (err, results) => {
            if (err) {
                return reject(err); // Reject the promise if there's a database error
            }
            resolve(results); // Resolve with the query results
        });
    });
};

exports.checkSignupDetails = (phoneNumber, NICnumber) => {
    return new Promise((resolve, reject) => {
        let conditions = [];
        let params = [];

        if (phoneNumber) {
            const formattedPhoneNumber = `+${String(phoneNumber).replace(/^\+/, "")}`;
            conditions.push("phoneNumber = ?");
            params.push(formattedPhoneNumber);
        }

        if (NICnumber) {
            conditions.push("NICnumber = ?");
            params.push(NICnumber);
        }

        const checkQuery = `SELECT * FROM users WHERE ${conditions.join(" OR ")}`;

        db.plantcare.query(checkQuery, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};


exports.updateFirstLastName = (userId, firstName, lastName, buidingname, streetname, city) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET firstName = ?, lastName = ?, houseNo=?, streetName=?, city=? WHERE id = ?';
        db.plantcare.query(sql, [firstName, lastName, buidingname, streetname,city, userId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.affectedRows); // Return affected rows
            }
        });
    });
};


exports.checkBankDetailsExist = (userId) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT COUNT(*) AS count FROM userbankdetails WHERE userId = ?";
        db.plantcare.query(query, [userId], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result[0].count > 0); // Return true if count > 0
        });
    });
};

// Function to insert bank details into `userbankdetails` table
exports.insertBankDetails = (userId, address, accountNumber, accountHolderName, bankName, branchName, callback) => {
    const query = `
  INSERT INTO userbankdetails (userId, address, accNumber, accHolderName, bankName, branchName)
  VALUES (?, ?, ?, ?, ?, ?)
`;
    db.plantcare.query(query, [userId, address, accountNumber, accountHolderName, bankName, branchName], callback);
};

// // Function to update the user's `farmerQr` column with the generated QR code
// exports.updateQRCode = (userId, qrCodeImage, callback) => {
//     const query = `
//   UPDATE users
//   SET farmerQr = ?
//   WHERE id = ?
// `;
//     db.query(query, [qrCodeImage, userId], callback);
// };


// // Function to generate and save QR code to the public/farmerQr folder
// exports.generateQRCode = (data, callback) => {
//     // Create the path for saving the QR code image
//     const qrFolderPath = path.join(__dirname, '..', 'public', 'farmerQr');
//     if (!fs.existsSync(qrFolderPath)) {
//         // Ensure the folder exists
//         fs.mkdirSync(qrFolderPath, { recursive: true });
//     }

//     // Create a filename for the QR code image (you can customize the filename as needed)
//     const qrFileName = `qrCode_${Date.now()}.png`;
//     const qrFilePath = path.join(qrFolderPath, qrFileName);

//     // Generate the QR code and save it as a file
//     QRCode.toFile(qrFilePath, JSON.stringify(data), { type: 'image/png' }, (err) => {
//         if (err) {
//             return callback(err);
//         }

//         // Return the relative file path to be stored in the database
//         const relativeFilePath = path.join('public', 'farmerQr', qrFileName);
//         callback(null, relativeFilePath);
//     });
// };


// Function to update the user's `farmerQr` column with the generated QR code (file path)
exports.updateQRCode = (userId, qrCodeImage, callback) => {
    const query = `
      UPDATE users
      SET farmerQr = ?
      WHERE id = ?
    `;
    db.plantcare.query(query, [qrCodeImage, userId], callback);
}


// Function to generate and save QR code to the public/farmerQr folder
exports.generateQRCode = (data, callback) => {
    const qrFolderPath = path.join(__dirname, '..', 'public', 'farmerQr');
    if (!fs.existsSync(qrFolderPath)) {
        // Ensure the folder exists
        fs.mkdirSync(qrFolderPath, { recursive: true });
    }

    // Create a filename for the QR code image (you can customize the filename as needed)
    const qrFileName = `qrCode_${Date.now()}.png`;
    const qrFilePath = path.join(qrFolderPath, qrFileName);

    // Generate the QR code and save it as a file
    QRCode.toFile(qrFilePath, JSON.stringify(data), { type: 'image/png' }, (err) => {
        if (err) {
            return callback(err);
        }

        // Return the relative file path to be stored in the database
        const relativeFilePath = path.join('public', 'farmerQr', qrFileName);
        callback(null, relativeFilePath);
    });
};



// Function to update address details and generate a new QR code with the updated address
exports.updateAddressAndQRCode = (userId, houseNo, streetName, city, callback) => {
    // First, update the address details in the database
    const updateQuery = `
      UPDATE users
      SET houseNo = ?, streetName = ?, city = ?
      WHERE id = ?
    `;

    db.plantcare.query(updateQuery, [houseNo, streetName, city, userId], (err) => {
        if (err) {
            return callback(err); // Error if updating address fails
        }

        // After updating address, fetch all user data to include in the QR code
        const selectQuery = `
            SELECT id, firstName, lastName, phoneNumber, NICnumber, district, 
                   houseNo, streetName, city
            FROM users
            WHERE id = ?
        `;

        db.plantcare.query(selectQuery, [userId], (fetchErr, results) => {
            if (fetchErr) {
                return callback(fetchErr); // Error if fetching user data fails
            }

            if (results.length === 0) {
                return callback(new Error('User not found.'));
            }

            const user = results[0]; // Assuming the user exists

            // Fetch the bank details for the user from the `userbankdetails` table
            const bankDetailsQuery = `
                SELECT accNumber, accHolderName, bankName, branchName, address
                FROM userbankdetails
                WHERE userId = ?
            `;

            db.plantcare.query(bankDetailsQuery, [userId], (bankErr, bankResults) => {
                if (bankErr) {
                    return callback(bankErr); // Error if fetching bank details fails
                }

                if (bankResults.length === 0) {
                    return callback(new Error('Bank details not found.'));
                }

                const bankDetails = bankResults[0]; // Assuming bank details exist

                // Prepare the QR data with both user information and bank details
                const qrData = {
                    userInfo: {
                        id: user.id,
                        firstName: user.firstName || "Not provided",
                        lastName: user.lastName || "Not provided",
                        phoneNumber: user.phoneNumber || "Not provided",
                        NICnumber: user.NICnumber || "Not provided",
                        district: user.district || "Not provided",
                        houseNo: user.houseNo || "Not provided",
                        streetName: user.streetName || "Not provided",
                        city: user.city || "Not provided"
                    },
                    bankInfo: {
                        accNumber: bankDetails.accNumber || "Not provided",
                        accHolderName: bankDetails.accHolderName || "Not provided",
                        bankName: bankDetails.bankName || "Not provided",
                        branchName: bankDetails.branchName || "Not provided",
                        address: bankDetails.address || "Not provided"
                    }
                };

                console.log(qrData);

                // Generate QR code with the complete user and bank data
                exports.generateQRCode(qrData, (qrErr, qrCodeImagePath) => {
                    if (qrErr) {
                        return callback(qrErr); // Error generating QR code
                    }

                    // Update the farmerQr column with the new QR code image file path
                    exports.updateQRCode(userId, qrCodeImagePath, (updateQrErr) => {
                        if (updateQrErr) {
                            return callback(updateQrErr); // Error updating QR code
                        }

                        // Successfully updated address and QR code
                        callback(null, "Address and QR code updated successfully");
                    });
                });
            });
        });
    });
};


// exports.checkAddressFields = async(userId) => {
//     return new Promise((resolve, reject) => {
//         const checkQuery = `
//         SELECT houseNo, streetName, city 
//         FROM users 
//         WHERE id = ?
//       `;

//         db.query(checkQuery, [userId], (err, result) => {
//             if (err) {
//                 reject(err);
//             }

//             if (result.length === 0) {
//                 resolve(null); // No user found with the given ID
//             } else {
//                 const { houseNo, streetName, city } = result[0];
//                 resolve({ houseNo, streetName, city });
//             }
//         });
//     });
// };

exports.createQrCode = (userId, callback) => {
    const qrData = {
        userInfo: {
            id: userId,
        },
    };

    console.log(qrData);

    // Generate the QR code
    exports.generateQRCode(qrData, (qrErr, qrCodeImagePath) => {
        if (qrErr) {
            return callback(qrErr); // Error generating QR code
        }

        // Update the farmerQr column with the new QR code image file path
        exports.updateQRCode(userId, qrCodeImagePath, (updateQrErr) => {
            if (updateQrErr) {
                return callback(updateQrErr); // Error updating QR code
            }

            // Successfully updated QR code
            callback(null, "QR code created and updated successfully");
        });
    });
};





























































// const jwt = require("jsonwebtoken");
// const db = require("../startup/database");
// const asyncHandler = require("express-async-handler");
// const QRCode = require('qrcode');
// const fs = require('fs');
// const path = require('path');

// exports.loginUser = (phonenumber) => {
//     return new Promise((resolve, reject) => {
//         const sql = "SELECT * FROM users WHERE phoneNumber = ? LIMIT 1";
//         db.query(sql, [phonenumber], (err, results) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(results);
//             }
//         });
//     });
// };

// exports.checkUserByPhoneNumber = (phoneNumber) => {
//     return new Promise((resolve, reject) => {
//         const query = "SELECT * FROM users WHERE phoneNumber = ?";
//         db.query(query, [phoneNumber], (err, results) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(results);
//             }
//         });
//     });
// };

// exports.insertUser = (firstName, lastName, phoneNumber, NICnumber, district) => {
//     return new Promise((resolve, reject) => {
//         const query =
//             "INSERT INTO users(`firstName`, `lastName`, `phoneNumber`, `NICnumber`, `district`) VALUES(?, ?, ?, ?,?)";
//         db.query(
//             query, [firstName, lastName, phoneNumber, NICnumber, district],
//             (err, results) => {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(results);
//                 }
//             }
//         );
//     });
// };

// // DAO function to retrieve user profile by userId
// exports.getUserProfileById = (userId) => {
//     return new Promise((resolve, reject) => {
//         const sql = "SELECT firstName, lastName, phoneNumber, NICnumber, district, farmerQr FROM users WHERE id = ?";
//         db.query(sql, [userId], (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             if (results.length === 0) {
//                 return resolve(null);
//             }
//             const userProfile = results[0];
            
//             // If the farmerQr exists in the database as binary (BLOB), convert it to base64
//             if (userProfile.farmerQr) {
//                 // Convert the binary data (BLOB) to base64 string
//                 userProfile.farmerQr = userProfile.farmerQr.toString('base64');
//                 console.log(userProfile.farmerQr);
//             }

//             resolve(userProfile);
//         });
//     });
// };


// exports.updateUserPhoneNumber = (userId, newPhoneNumber) => {
//     return new Promise((resolve, reject) => {
//         const sql = "UPDATE users SET phoneNumber = ? WHERE id = ?";
//         db.query(sql, [newPhoneNumber, userId], (err, results) => {
//             if (err) {
//                 return reject(err); // Reject the promise if there's a database error
//             }
//             resolve(results); // Resolve with the query results
//         });
//     });
// };

// exports.checkSignupDetails = (phoneNumber, NICnumber) => {
//     return new Promise((resolve, reject) => {
//         let conditions = [];
//         let params = [];

//         if (phoneNumber) {
//             const formattedPhoneNumber = `+${String(phoneNumber).replace(/^\+/, "")}`;
//             conditions.push("phoneNumber = ?");
//             params.push(formattedPhoneNumber);
//         }

//         if (NICnumber) {
//             conditions.push("NICnumber = ?");
//             params.push(NICnumber);
//         }

//         const checkQuery = `SELECT * FROM users WHERE ${conditions.join(" OR ")}`;

//         db.query(checkQuery, params, (err, results) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(results);
//             }
//         });
//     });
// };


// exports.updateFirstLastName = (userId, firstName, lastName) => {
//     return new Promise((resolve, reject) => {
//         const sql = 'UPDATE users SET firstName = ?, lastName = ? WHERE id = ?';
//         db.query(sql, [firstName, lastName, userId], (err, results) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(results.affectedRows); // Return affected rows
//             }
//         });
//     });
// };



// // Function to insert bank details into `userbankdetails` table
// exports.insertBankDetails = (userId, address, accountNumber, accountHolderName, bankName, branchName, callback) => {
//     const query = `
//   INSERT INTO userbankdetails (userId, address, accNumber, accHolderName, bankName, branchName)
//   VALUES (?, ?, ?, ?, ?, ?)
// `;
//     db.query(query, [userId, address, accountNumber, accountHolderName, bankName, branchName], callback);
// };

// exports.updateQRCode = (userId, qrCodeBase64, callback) => {
//     const query = `
//       UPDATE users
//       SET farmerQr = ?
//       WHERE id = ?
//     `;
//     db.query(query, [qrCodeBase64, userId], callback);
// }

// exports.generateQRCode = (data, callback) => {
//     // Generate the QR code as a Base64 string
//     QRCode.toDataURL(JSON.stringify(data), { type: 'image/png' }, (err, qrCodeBase64) => {
//         if (err) {
//             return callback(err);
//         }
//         callback(null, qrCodeBase64);
//     });
// };

// exports.updateAddressAndQRCode = (userId, houseNo, streetName, city, callback) => {
//     // First, update the address details in the database
//     const updateQuery = `
//       UPDATE users
//       SET houseNo = ?, streetName = ?, city = ?
//       WHERE id = ?
//     `;

//     db.query(updateQuery, [houseNo, streetName, city, userId], (err) => {
//         if (err) {
//             return callback(err); // Error if updating address fails
//         }

//         // After updating address, fetch all user data to include in the QR code
//         const selectQuery = `
//             SELECT id, firstName, lastName, phoneNumber, NICnumber, district, 
//                    houseNo, streetName, city
//             FROM users
//             WHERE id = ?
//         `;

//         db.query(selectQuery, [userId], (fetchErr, results) => {
//             if (fetchErr) {
//                 return callback(fetchErr); // Error if fetching user data fails
//             }

//             if (results.length === 0) {
//                 return callback(new Error('User not found.'));
//             }

//             const user = results[0]; // Assuming the user exists

//             // Fetch the bank details for the user from the `userbankdetails` table
//             const bankDetailsQuery = `
//                 SELECT accNumber, accHolderName, bankName, branchName, address
//                 FROM userbankdetails
//                 WHERE userId = ?
//             `;

//             db.query(bankDetailsQuery, [userId], (bankErr, bankResults) => {
//                 if (bankErr) {
//                     return callback(bankErr); // Error if fetching bank details fails
//                 }

//                 if (bankResults.length === 0) {
//                     return callback(new Error('Bank details not found.'));
//                 }

//                 const bankDetails = bankResults[0]; // Assuming bank details exist

//                 // Prepare the QR data with both user information and bank details
//                 const qrData = {
//                     userInfo: {
//                         id: user.id,
//                         firstName: user.firstName || "Not provided",
//                         lastName: user.lastName || "Not provided",
//                         phoneNumber: user.phoneNumber || "Not provided",
//                         NICnumber: user.NICnumber || "Not provided",
//                         district: user.district || "Not provided",
//                         houseNo: user.houseNo || "Not provided",
//                         streetName: user.streetName || "Not provided",
//                         city: user.city || "Not provided"
//                     },
//                     bankInfo: {
//                         accNumber: bankDetails.accNumber || "Not provided",
//                         accHolderName: bankDetails.accHolderName || "Not provided",
//                         bankName: bankDetails.bankName || "Not provided",
//                         branchName: bankDetails.branchName || "Not provided",
//                         address: bankDetails.address || "Not provided"
//                     }
//                 };

//                 // Generate QR code with the complete user and bank data (Base64 format)
//                 exports.generateQRCode(qrData, (qrErr, qrCodeBase64) => {
//                     if (qrErr) {
//                         return callback(qrErr); // Error generating QR code
//                     }

//                     // Update the farmerQr column with the new Base64 QR code
//                     exports.updateQRCode(userId, qrCodeBase64, (updateQrErr) => {
//                         if (updateQrErr) {
//                             return callback(updateQrErr); // Error updating QR code
//                         }

//                         // Successfully updated address and QR code
//                         callback(null, "Address and QR code updated successfully");
//                     });
//                 });
//             });
//         });
//     });
// };

// exports.checkAddressFields = async(userId) => {
//     return new Promise((resolve, reject) => {
//         const checkQuery = `
//         SELECT houseNo, streetName, city 
//         FROM users 
//         WHERE id = ?
//       `;

//         db.query(checkQuery, [userId], (err, result) => {
//             if (err) {
//                 reject(err);
//             }

//             if (result.length === 0) {
//                 resolve(null); 
//             } else {
//                 const { houseNo, streetName, city } = result[0];
//                 resolve({ houseNo, streetName, city });
//             }
//         });
//     });
// };