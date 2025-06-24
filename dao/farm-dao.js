// const db = require("../startup/database");

// exports.createFarmWithStaff = (farmData) => {
//     return new Promise((resolve, reject) => {
//         let connection;

//         db.plantcare.getConnection((err, conn) => {
//             if (err) {
//                 return reject(new Error(`Database connection error: ${err.message}`));
//             }
//             connection = conn;

//             connection.beginTransaction(async (beginErr) => {
//                 if (beginErr) {
//                     connection.release();
//                     return reject(new Error(`Transaction start error: ${beginErr.message}`));
//                 }

//                 try {
//                     // Insert farm
//                     const insertFarmSql = `
//                         INSERT INTO farms 
//                         (userId, farmName, farmIndex, extentha, extentac, extentp, district, plotNo, street, city, staffCount, appUserCount)
//                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//                     `;

//                     const farmValues = [
//                         farmData.userId,
//                         farmData.farmName,
//                         farmData.farmIndex,
//                         farmData.extentha,
//                         farmData.extentac,
//                         farmData.extentp,
//                         farmData.district,
//                         farmData.plotNo,
//                         farmData.street,
//                         farmData.city,
//                         farmData.staffCount,
//                         farmData.appUserCount
//                     ];

//                     const [farmResult] = await connection.promise().query(insertFarmSql, farmValues);
//                     const farmId = farmResult.insertId;
//                     const staffIds = [];

//                     // Insert staff if provided
//                     if (farmData.staff && Array.isArray(farmData.staff) && farmData.staff.length > 0) {
//                         const insertStaffSql = `
//                             INSERT INTO farmstaff 
//                             (ownerId, farmId, firstName, lastName, phoneCode, phoneNumber, role, image)
//                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//                         `;

//                         for (const staff of farmData.staff) {
//                             const staffValues = [
//                                 farmData.userId,
//                                 farmId,
//                                 staff.firstName,
//                                 staff.lastName,
//                                 staff.phoneCode,
//                                 staff.phoneNumber,
//                                 staff.role,
//                                 staff.image || null
//                             ];

//                             const [staffResult] = await connection.promise().query(insertStaffSql, staffValues);
//                             staffIds.push(staffResult.insertId);
//                         }
//                     }

//                     connection.commit((commitErr) => {
//                         if (commitErr) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 reject(new Error(`Commit error: ${commitErr.message}`));
//                             });
//                         }

//                         connection.release();
//                         resolve({
//                             success: true,
//                             farmId,
//                             staffIds,
//                             message: 'Farm and staff created successfully'
//                         });
//                     });
//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         reject(new Error(`Database operation error: ${error.message}`));
//                     });
//                 }
//             });
//         });
//     });
// };

// const db = require("../startup/database");

// exports.createFarmWithStaff = async (farmData) => {
//     let connection;

//     try {
//         // Get connection from pool
//         connection = await new Promise((resolve, reject) => {
//             db.plantcare.getConnection((err, conn) => {
//                 if (err) return reject(err);
//                 resolve(conn);
//             });
//         });

//         // Start transaction
//         await new Promise((resolve, reject) => {
//             connection.beginTransaction(err => {
//                 if (err) return reject(err);
//                 resolve(true);
//             });
//         });

//         // Format phone numbers and validate
//         if (farmData.staff && Array.isArray(farmData.staff)) {
//             farmData.staff = farmData.staff.map(staff => {
//                 // Ensure phone number has +94 prefix
//                 let phoneNumber = staff.phoneNumber;
//                 if (!phoneNumber.startsWith('+94')) {
//                     if (phoneNumber.startsWith('0')) {
//                         phoneNumber = '+94' + phoneNumber.substring(1);
//                     } else {
//                         phoneNumber = '+94' + phoneNumber;
//                     }
//                 }
//                 return {
//                     ...staff,
//                     phoneNumber: phoneNumber.replace(/\D/g, '') // Remove non-digit characters
//                 };
//             });
//         }

//         // Insert farm
//         const insertFarmSql = `
//             INSERT INTO farms 
//             (userId, farmName, farmIndex, extentha, extentac, extentp, district, plotNo, street, city, staffCount, appUserCount,imageId)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
//         `;

//         const farmValues = [
//             farmData.userId,
//             farmData.farmName,
//             farmData.farmIndex,
//             farmData.extentha,
//             farmData.extentac,
//             farmData.extentp,
//             farmData.district,
//             farmData.plotNo,
//             farmData.street,
//             farmData.city,
//             farmData.staffCount,
//             farmData.appUserCount,
//             farmData.farmImage
//         ];

//         const [farmResult] = await connection.promise().query(insertFarmSql, farmValues);
//         const farmId = farmResult.insertId;
//         const staffIds = [];

//         // Insert staff if provided
//         if (farmData.staff && farmData.staff.length > 0) {
//             const insertStaffSql = `
//                 INSERT INTO farmstaff 
//                 (ownerId, farmId, firstName, lastName, phoneCode, phoneNumber, role, image)
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//             `;

//             for (const staff of farmData.staff) {
//                 const [staffResult] = await connection.promise().query(insertStaffSql, [
//                     farmData.userId,
//                     farmId,
//                     staff.firstName,
//                     staff.lastName,
//                     '+94', // Hardcoded as we've formatted the number
//                     staff.phoneNumber.replace('+94', ''), // Store without country code
//                     staff.role,
//                     staff.image || null
//                 ]);
//                 staffIds.push(staffResult.insertId);
//             }
//         }

//         // Commit transaction
//         await new Promise((resolve, reject) => {
//             connection.commit(err => {
//                 if (err) return reject(err);
//                 resolve(true);
//             });
//         });

//         return {
//             success: true,
//             farmId,
//             staffIds,
//             message: 'Farm and staff created successfully'
//         };

//     } catch (error) {
//         // Rollback transaction if connection exists
//         if (connection) {
//             await new Promise(resolve => {
//                 connection.rollback(() => resolve(true));
//             });
//         }
//         console.error('Database error:', error);
//         throw error;

//     } finally {
//         // Release connection back to pool
//         if (connection) {
//             connection.release();
//         }
//     }
// };


const db = require("../startup/database");

exports.createFarmWithStaff = async (farmData) => {
    let connection;

    try {
        // Get connection from pool
        connection = await new Promise((resolve, reject) => {
            db.plantcare.getConnection((err, conn) => {
                if (err) return reject(err);
                resolve(conn);
            });
        });

        // Start transaction
        await new Promise((resolve, reject) => {
            connection.beginTransaction(err => {
                if (err) return reject(err);
                resolve(true);
            });
        });

        // Get the current farm count for this user to generate farmIndex
        const getFarmCountSql = `SELECT COUNT(*) as farmCount FROM farms WHERE userId = ?`;
        const [countResult] = await connection.promise().query(getFarmCountSql, [farmData.userId]);
        const currentFarmCount = countResult[0].farmCount;
        const nextFarmIndex = currentFarmCount + 1;

        // Format phone numbers and validate
        if (farmData.staff && Array.isArray(farmData.staff)) {
            farmData.staff = farmData.staff.map(staff => {
                // Ensure phone number has +94 prefix
                let phoneNumber = staff.phoneNumber;
                if (!phoneNumber.startsWith('+94')) {
                    if (phoneNumber.startsWith('0')) {
                        phoneNumber = '+94' + phoneNumber.substring(1);
                    } else {
                        phoneNumber = '+94' + phoneNumber;
                    }
                }
                return {
                    ...staff,
                    phoneNumber: phoneNumber.replace(/\D/g, '') // Remove non-digit characters
                };
            });
        }

        // Insert farm with auto-generated farmIndex
        const insertFarmSql = `
            INSERT INTO farms 
            (userId, farmName, farmIndex, extentha, extentac, extentp, district, plotNo, street, city, staffCount, appUserCount, imageId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const farmValues = [
            farmData.userId,
            farmData.farmName,
            nextFarmIndex, // Auto-generated farmIndex
            farmData.extentha,
            farmData.extentac,
            farmData.extentp,
            farmData.district,
            farmData.plotNo,
            farmData.street,
            farmData.city,
            farmData.staffCount,
            farmData.appUserCount,
            farmData.farmImage
        ];

        const [farmResult] = await connection.promise().query(insertFarmSql, farmValues);
        const farmId = farmResult.insertId;
        const staffIds = [];

        // Insert staff if provided
        if (farmData.staff && farmData.staff.length > 0) {
            const insertStaffSql = `
                INSERT INTO farmstaff 
                (ownerId, farmId, firstName, lastName, phoneCode, phoneNumber, role, image)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            for (const staff of farmData.staff) {
                const [staffResult] = await connection.promise().query(insertStaffSql, [
                    farmData.userId,
                    farmId,
                    staff.firstName,
                    staff.lastName,
                    '+94', // Hardcoded as we've formatted the number
                    staff.phoneNumber.replace('+94', ''), // Store without country code
                    staff.role,
                    staff.image || null
                ]);
                staffIds.push(staffResult.insertId);
            }
        }

        // Commit transaction
        await new Promise((resolve, reject) => {
            connection.commit(err => {
                if (err) return reject(err);
                resolve(true);
            });
        });

        return {
            success: true,
            farmId,
            farmIndex: nextFarmIndex, // Return the generated farmIndex
            staffIds,
            message: 'Farm and staff created successfully'
        };

    } catch (error) {
        // Rollback transaction if connection exists
        if (connection) {
            await new Promise(resolve => {
                connection.rollback(() => resolve(true));
            });
        }
        console.error('Database error:', error);
        throw error;

    } finally {
        // Release connection back to pool
        if (connection) {
            connection.release();
        }
    }
};

exports.getAllFarmByUserId = async (userId) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT userId, farmName, farmIndex, extentha, extentac, extentp, district, plotNo, street, city, staffCount, appUserCount, imageId
        FROM farms
        WHERE userId = ?
        ORDER BY createdAt DESC
      `;
        db.plantcare.query(query, [userId], (error, results) => {
            if (error) {
                console.error("Error fetching farms:", error);
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};


exports.createPaymentAndUpdateMembership = async (paymentData) => {
    let connection;

    try {
        // Get connection from pool
        connection = await new Promise((resolve, reject) => {
            db.plantcare.getConnection((err, conn) => {
                if (err) return reject(err);
                resolve(conn);
            });
        });

        // Start transaction
        await new Promise((resolve, reject) => {
            connection.beginTransaction(err => {
                if (err) return reject(err);
                resolve(true);
            });
        });

        // Insert payment record
        const insertPaymentSql = `
            INSERT INTO membershippayment 
            (userId, payment, plan, expireDate, activeStatus)
            VALUES (?, ?, ?, ?, 1)
        `;

        const paymentValues = [
            paymentData.userId,
            paymentData.payment,
            paymentData.plan,
            paymentData.expireDate
        ];

        const [paymentResult] = await connection.promise().query(insertPaymentSql, paymentValues);
        const paymentId = paymentResult.insertId;

        // Update user membership to 'Pro'
        const updateUserSql = `
            UPDATE users 
            SET membership = 'Pro'
            WHERE id = ?
        `;

        const [userResult] = await connection.promise().query(updateUserSql, [paymentData.userId]);

        // Commit transaction
        await new Promise((resolve, reject) => {
            connection.commit(err => {
                if (err) return reject(err);
                resolve(true);
            });
        });

        return {
            success: true,
            paymentId,
            userUpdated: userResult.affectedRows > 0,
            message: 'Payment processed and membership updated successfully'
        };

    } catch (error) {
        // Rollback transaction if connection exists
        if (connection) {
            await new Promise(resolve => {
                connection.rollback(() => resolve(true));
            });
        }
        console.error('Database error:', error);
        throw error;

    } finally {
        // Release connection back to pool
        if (connection) {
            connection.release();
        }
    }
};