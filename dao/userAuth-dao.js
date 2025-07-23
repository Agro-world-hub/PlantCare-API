const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const asyncHandler = require("express-async-handler");
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const uploadFileToS3 = require('../Middlewares/s3upload')
// exports.loginUser = (phonenumber) => {
//     return new Promise((resolve, reject) => {
//         const sql = "SELECT * FROM users WHERE phoneNumber = ? LIMIT 1";
//         db.plantcare.query(sql, [phonenumber], (err, results) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(results);
//             }
//         });
//     });
// };

// exports.loginUser = (phonenumber) => {
//     return new Promise((resolve, reject) => {
//         const sql = `
//             SELECT 
//                 u.*, 
//                 mp.activeStatus AS paymentActiveStatus,
//                 (
//                     SELECT COUNT(*) 
//                     FROM farms f 
//                     WHERE f.userId = u.id
//                 ) AS farmCount
//             FROM users u
//             LEFT JOIN membershippayment mp ON u.id = mp.userId
//             WHERE u.phoneNumber = ?
//             ORDER BY mp.id DESC
//             LIMIT 1
//         `;

//         db.plantcare.query(sql, [phonenumber], (err, results) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(results);
//             }
//         });
//     });
// };

exports.loginUser = (phonenumber) => {
    return new Promise((resolve, reject) => {
        // First, check if the phone number is in the users table
        const usersSql = `
            SELECT 
                u.*, 
                mp.activeStatus AS paymentActiveStatus,
                (
                    SELECT COUNT(*) 
                    FROM farms f 
                    WHERE f.userId = u.id
                ) AS farmCount,
                 'Owner' AS role,
                 u.id AS ownerId
            FROM users u
            LEFT JOIN membershippayment mp ON u.id = mp.userId
            WHERE u.phoneNumber = ?
            ORDER BY mp.id DESC
            LIMIT 1
        `;

        db.plantcare.query(usersSql, [phonenumber], (err, userResults) => {
            if (err) {
                return reject(err);
            }

            if (userResults.length > 0) {
                return resolve(userResults);
            }

            const farmstaffSql = `
                SELECT 
                    fs.*, 
                    mp.activeStatus AS paymentActiveStatus, 
                    1 AS farmCount,
                     fs.ownerId AS ownerId 
                FROM farmstaff fs
                LEFT JOIN membershippayment mp ON fs.ownerId = mp.userId
                 WHERE CONCAT(fs.phoneCode, fs.phoneNumber) = ?
                LIMIT 1
            `;

            db.plantcare.query(farmstaffSql, [phonenumber], (err, farmstaffResults) => {
                if (err) {
                    return reject(err);
                }

                // If farmstaff record is found, resolve with farmstaff data
                if (farmstaffResults.length > 0) {
                    return resolve(farmstaffResults);
                }

                // If no match found in both tables
                resolve([]);
            });
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

exports.insertUser = (firstName, lastName, phoneNumber, NICnumber, district, farmerLanguage) => {
    return new Promise((resolve, reject) => {
        const query =
            "INSERT INTO users(`firstName`, `lastName`, `phoneNumber`, `NICnumber`, `district`, `language`) VALUES(?, ?, ?, ?,?, ?)";
        db.plantcare.query(
            query, [firstName, lastName, phoneNumber, NICnumber, district, farmerLanguage],
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

// exports.getUserProfileById = (userId) => {
//     return new Promise((resolve, reject) => {
//         const sql = "SELECT * FROM users WHERE id = ?";
//         db.plantcare.query(sql, [userId], (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             if (results.length === 0) {
//                 return resolve(null);
//             }
//             const userProfile = results[0];

//             resolve(userProfile);
//         });
//     });
// };
// exports.getUserProfileById = (userId) => {
//     return new Promise((resolve, reject) => {
//         // First, check if the user exists in the users table
//         const usersSql = "SELECT * FROM users WHERE id = ?";

//         db.plantcare.query(usersSql, [userId], (err, userResults) => {
//             if (err) {
//                 return reject(err);
//             }

//             // If a user is found in the users table, return the user profile
//             if (userResults.length > 0) {
//                 return resolve(userResults[0]);  // Return the user profile from users table
//             }

//             // If no user found in users table, check the farmstaff table
//             const farmstaffSql = "SELECT * FROM farmstaff WHERE id = ?";

//             db.plantcare.query(farmstaffSql, [userId], (err, farmstaffResults) => {
//                 if (err) {
//                     return reject(err);
//                 }

//                 // If farmstaff record is found, return the farmstaff profile
//                 if (farmstaffResults.length > 0) {
//                     return resolve(farmstaffResults[0]);  // Return the farmstaff profile
//                 }

//                 // If no record is found in either table, return null
//                 resolve(null);
//             });
//         });
//     });
// };

exports.getUserProfileById = (userId, ownerId) => {
    return new Promise((resolve, reject) => {
        // First, check if the user exists in the users table
        const usersSql = `
            SELECT 
                id,
                firstName,
                lastName,
                phoneNumber,
                NICnumber,
                LEFT(profileImage, 256) as profileImage,
                LEFT(farmerQr, 256) as farmerQr,
                membership,
                activeStatus,
                'Owner' AS role
            FROM users 
            WHERE id = ?
        `;

        db.plantcare.query(usersSql, [userId], (err, userResults) => {
            if (err) {
                return reject(err);
            }

            // If a user is found in the users table
            if (userResults.length > 0) {
                const user = userResults[0];

                // Get farm count for this user
                const farmCountSql = "SELECT COUNT(*) as farmCount FROM farms WHERE userId = ?";

                db.plantcare.query(farmCountSql, [userId], (err, farmCountResults) => {
                    if (err) {
                        return reject(err);
                    }

                    const farmCount = farmCountResults[0].farmCount || 0;

                    // Prepare the response with additional fields
                    const userProfile = {
                        ...user,
                        membership: user.membership || null,
                        paymentActiveStatus: user.activeStatus === 1 ? 1 : 0, // 1 for active, 0 for inactive
                        farmCount: farmCount,
                        role:user.role
                    };

                    return resolve(userProfile);
                });
            } else {
                // If no user found in users table, check the farmstaff table
                    const farmstaffSql = `
                        SELECT 
                            farmstaff.id,
                            farmstaff.firstName,
                            farmstaff.lastName,
                            farmstaff.phoneNumber,
                            LEFT(farmstaff.Image, 256) as profileImage,
                            LEFT(users.farmerQr, 256) as farmerQr, 
                            farmstaff.role
                        FROM farmstaff 
                        LEFT JOIN users ON farmstaff.ownerId = users.id 
                        WHERE farmstaff.id = ?
                    `;

                db.plantcare.query(farmstaffSql, [userId], (err, farmstaffResults) => {
                    if (err) {
                        return reject(err);
                    }

                    // If farmstaff record is found
                    if (farmstaffResults.length > 0) {
                        const farmstaff = farmstaffResults[0];

                        // For farmstaff, they might not have farms directly associated
                        // But we can still check if there are any farms associated with this staff member
                        const farmCountSql = "SELECT COUNT(*) as farmCount FROM farms WHERE userId = ?";

                        db.plantcare.query(farmCountSql, [ownerId], (err, farmCountResults) => {
                            if (err) {
                                return reject(err);
                            }

                            const farmCount = farmCountResults[0].farmCount || 0;

                            // Prepare the response with additional fields
                            const farmstaffProfile = {
                                ...farmstaff,
                                membership: farmstaff.membership || null,
                                paymentActiveStatus: farmstaff.activeStatus === 1 ? 1 : 0, // 1 for active, 0 for inactive
                                farmCount: farmCount,
                                role:farmstaff.role
                            };

                            return resolve(farmstaffProfile);
                        });
                    } else {
                        // If no record is found in either table, return null
                        resolve(null);
                    }
                });
            }
        });
    });
};


exports.updateUserPhoneNumber = (userId, newPhoneNumber) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE users SET phoneNumber = ? WHERE id = ?";
        db.plantcare.query(sql, [newPhoneNumber, userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
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


exports.updateFirstLastName = (userId, firstName, lastName, buidingname, streetname, city, district) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET firstName = ?, lastName = ?, houseNo=?, streetName=?, city=?, district=? WHERE id = ?';
        db.plantcare.query(sql, [firstName, lastName, buidingname, streetname, city, district, userId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.affectedRows);
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
            resolve(result[0].count > 0);
        });
    });
};

exports.insertBankDetails = (userId, accountNumber, accountHolderName, bankName, branchName, callback) => {
    return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO userbankdetails (userId, accNumber, accHolderName, bankName, branchName)
          VALUES ( ?, ?, ?, ?, ?)
        `;
        db.plantcare.query(query, [userId, accountNumber, accountHolderName, bankName, branchName], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};


// exports.updateQRCode = (userId, qrCodeImage, callback) => {
//     return new Promise((resolve, reject) => {
//         const query = `
//           UPDATE users
//           SET farmerQr = ?
//           WHERE id = ?
//         `;
//         db.plantcare.query(query, [qrCodeImage, userId], (err, result) => {
//             if (err) {
//                 return reject(err);
//             }
//             resolve(result); 
//         });
//     });
// }
exports.updateQRCode = (userId, qrCodeImage) => {
    return new Promise((resolve, reject) => {
        const query = `
          UPDATE users
          SET farmerQr = ?
          WHERE id = ?
        `;
        db.plantcare.query(query, [qrCodeImage, userId], (err, result) => {
            if (err) {
                console.error("Error updating QR code:", err);
                return reject(err);
            }
            resolve(result);
            console.log(result);
        });
    });
};



exports.generateQRCode = (data, callback) => {
    const qrFolderPath = path.join(__dirname, '..', 'public', 'farmerQr');
    if (!fs.existsSync(qrFolderPath)) {
        // Ensure the folder exists
        fs.mkdirSync(qrFolderPath, { recursive: true });
    }
    const qrFileName = `qrCode_${Date.now()}.png`;
    const qrFilePath = path.join(qrFolderPath, qrFileName);

    QRCode.toFile(qrFilePath, JSON.stringify(data), { type: 'image/png' }, (err) => {
        if (err) {
            return callback(err);
        }

        const relativeFilePath = path.join('public', 'farmerQr', qrFileName);
        callback(null, relativeFilePath);
    });
};


// exports.createQrCode = async (userId, callback) => {
//     try {
//         const qrData = {
//             userInfo: {
//                 id: userId,
//             },
//         };
//         const qrCodeBase64 = await QRCode.toDataURL(JSON.stringify(qrData));

//         const qrCodeBuffer = Buffer.from(
//             qrCodeBase64.replace(/^data:image\/png;base64,/, ""),
//             'base64'
//         );
//         const fileName =  `qrCode_${userId}.png`;
//         const profileImageUrl = await uploadFileToS3(qrCodeBuffer, fileName, "users/farmerQr");

//         exports.updateQRCode(userId, profileImageUrl , (updateQrErr) => {
//             if (updateQrErr) {
//                 return callback(updateQrErr); 
//             }

//             callback(null, "QR code created and updated successfully");
//         });
//     } catch (err) {
//         return callback(err); 
//     }
// };

exports.createQrCode = async (userId, ownerId) => {
    try {
        const qrData = {
            userInfo: {
                id: userId,
            },
        };

        const qrCodeBase64 = await QRCode.toDataURL(JSON.stringify(qrData));

        const qrCodeBuffer = Buffer.from(
            qrCodeBase64.replace(/^data:image\/png;base64,/, ""),
            'base64'
        );
        const fileName = `qrCode_${userId}.png`;

        const profileImageUrl = await uploadFileToS3(qrCodeBuffer, fileName, `plantcareuser/owner${ownerId}`);
        await exports.updateQRCode(userId, profileImageUrl);

        return "QR code created and updated successfully";
    } catch (err) {
        console.error("Error in createQrCode:", err);
        throw err;
    }
};


exports.getUserProfileImage = async (userId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT profileImage FROM users WHERE id = ?";
        db.plantcare.query(sql, [userId], (err, results) => {
            if (err) {
                reject(err);
            } else if (results.length > 0) {
                resolve(results[0].profileImage);
            } else {
                resolve(null);
            }
        });
    });
};


exports.updateUserProfileImage = async (userId, profileImageUrl) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE users SET profileImage = ? WHERE id = ?";
        db.plantcare.query(sql, [profileImageUrl, userId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
                console.log(result);
            }
        });
    });
};


exports.deleteUserById = async (userId) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM users WHERE id = ?';

        db.plantcare.query(query, [userId], (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return reject(err);
            }

            console.log('Query executed successfully:', result);
            resolve(result);
        });
    });
};

exports.getFeedbackOptions = async () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM feedbacklist';

        db.plantcare.query(query, (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return reject(err);
            }
            resolve(result);
        });
    });
}

exports.savedeletedUser = async (firstname, lastname) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO deleteduser (firstName,lastName) VALUES (?,?)';

        db.plantcare.query(query, [firstname, lastname], (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return reject(err);
            }
            resolve({ insertId: result.insertId });
        });
    });
}
exports.saveUserFeedback = async ({ feedbackId, deletedUserId }) => {
    const query = `
      INSERT INTO userfeedback (feedbackId, deletedUserId)
      VALUES (?, ?)
    `;
    db.plantcare.query(query, [feedbackId, deletedUserId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            return err;
        }
        return result;
    });
};
