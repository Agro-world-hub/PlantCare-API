const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const asyncHandler = require("express-async-handler");

exports.getCropByCategory = (categorie) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM cropgroup WHERE category=?";
        db.plantcare.query(sql, [categorie], (err, results) => {
            if (err) {
                console.error("Error executing query:", err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.getCropByDistrict = (categorie, district) => {
    return new Promise((resolve, reject) => {
        const districtCleaned = district.trim();

        const sql = `
            SELECT DISTINCT cg.*
            FROM cropgroup cg
            INNER JOIN cropvariety cv ON cg.id = cv.cropGroupId
            INNER JOIN cropcalender cc ON cv.id = cc.cropVarietyId
            WHERE cg.category = ? AND cc.suitableAreas LIKE ?
        `;

        db.plantcare.query(sql, [categorie, `%${districtCleaned}%`], (err, results) => {
            if (err) {
                console.error("Error executing query:", err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};


exports.getCropByDistrict = (categorie, district) => {
    return new Promise((resolve, reject) => {
        const districtCleaned = district.trim();

        const sql = `
            SELECT DISTINCT cg.*
            FROM cropgroup cg
            INNER JOIN cropvariety cv ON cg.id = cv.cropGroupId
            INNER JOIN cropcalender cc ON cv.id = cc.cropVarietyId
            WHERE cg.category = ? AND cc.suitableAreas LIKE ?
        `;

        db.plantcare.query(sql, [categorie, `%${districtCleaned}%`], (err, results) => {
            if (err) {
                console.error("Error executing query:", err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.getCropVariety = (cropId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM cropvariety WHERE cropGroupId = ?";
        db.plantcare.query(sql, [cropId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.getCropCalenderDetails = (id, method, naofcul) => {
    return new Promise((resolve, reject) => {

        const sql = `SELECT * FROM cropcalender WHERE cropVarietyId = ? AND method = ? AND natOfCul = ?`;

        db.plantcare.query(sql, [id, method, naofcul], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};


exports.getCropCalendarFeed = (userId, cropId) => {
    return new Promise((resolve, reject) => {
        const sql = `
        SELECT * 
        FROM ongoingcultivations oc, ongoingcultivationscrops ocr, cropcalendardays cd 
        WHERE oc.id = ocr.ongoingCultivationId 
        AND ocr.cropCalendar = cd.cropId 
        AND oc.userId = ? 
        AND cd.cropId = ?`;

        db.plantcare.query(sql, [userId, cropId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};


exports.getOngoingCultivationsByUserId = (userId, callback) => {
    const sql = `
    SELECT * 
    FROM ongoingcultivations c 
    JOIN ongoingcultivationscrops oc ON c.id = oc.ongoingCultivationId
    JOIN cropcalender cc ON oc.cropCalendar = cc.id
    JOIN cropvariety cr ON cc.cropVarietyId = cr.id 
    WHERE c.userId = ?
  `;
    db.plantcare.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return callback(err, null);
        }
        callback(null, results);
    });
};


const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.plantcare.query(sql, params, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

exports.checkOngoingCultivation = (userId) => {
    const sql = "SELECT id FROM ongoingcultivations WHERE userId = ?";
    return query(sql, [userId]);
};

exports.createOngoingCultivation = (userId) => {
    const sql = "INSERT INTO ongoingcultivations(userId) VALUES (?)";
    return query(sql, [userId]);
};

exports.checkCropCount = (cultivationId) => {
    const sql = "SELECT COUNT(id) as count FROM ongoingcultivationscrops WHERE ongoingCultivationId = ?";
    return query(sql, [cultivationId]);
};

exports.checkEnrollCrop = (cultivationId) => {
    const sql = "SELECT cropCalendar, id FROM ongoingcultivationscrops WHERE ongoingCultivationId = ?";
    return query(sql, [cultivationId]);
};

exports.enrollOngoingCultivationCrop = (cultivationId, cropId, extentha, extentac, extentp, startDate, cultivationIndex) => {
    const sql = "INSERT INTO ongoingcultivationscrops(ongoingCultivationId, cropCalendar,  extentha, extentac, extentp , startedAt, cultivationIndex) VALUES (?, ?,?,?,?,?,?)";
    return query(sql, [cultivationId, cropId, extentha, extentac, extentp, startDate, cultivationIndex]);
};

// exports.getEnrollOngoingCultivationCrop = (cropId) => {
//     const sql = `
//     SELECT id 
//     FROM ongoingcultivationscrops 
//     WHERE cropCalendar = ?
//   `;
//     return new Promise((resolve, reject) => {
//         db.plantcare.query(sql, [cropId], (err, results) => {
//             if (err) {
//                 console.error("Database error in ongoingcultivationscrops:", err);
//                 reject(err);
//             } else {
//                 resolve(results);
//             }
//         });
//     });
// };

exports.getEnrollOngoingCultivationCrop = (cropId, UserId) => {
    const sql = `
    SELECT ocs.id  
    FROM ongoingcultivationscrops ocs
    JOIN ongoingcultivations oc ON oc.id = ocs.ongoingCultivationId
    WHERE ocs.cropCalendar = ? AND oc.userId = ?
  `;
    return new Promise((resolve, reject) => {
        db.plantcare.query(sql, [cropId, UserId], (err, results) => {
            if (err) {
                console.error("Database error in ongoingcultivationscrops:", err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};


exports.getEnrollOngoingCultivationCropByid = (id) => {
    console.log(id)
    const sql = `
    SELECT * 
    FROM ongoingcultivationscrops 
    WHERE id = ?
  `;
    return new Promise((resolve, reject) => {
        db.plantcare.query(sql, [id], (err, results) => {
            if (err) {
                console.error("Database error in ongoingcultivationscrops:", err);
                reject(err);
            } else {
                resolve(results);
                console.log(results)
            }
        });
    });
};

exports.updateOngoingCultivationCrop = (onCulscropID, extentha, extentac, extentp) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE ongoingcultivationscrops SET extentha = ?, extentac=?, extentp=? WHERE id = ?";
        db.plantcare.query(sql, [extentha, extentac, extentp,  onCulscropID], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.getSlaveCropCalendarDays = (onCulscropID) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT id, days FROM slavecropcalendardays WHERE onCulscropID = ?";
        db.plantcare.query(sql, [onCulscropID], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.updateSlaveCropCalendarDay = (id, formattedDate) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE slavecropcalendardays SET startingDate = ? WHERE id = ?";
        db.plantcare.query(sql, [formattedDate, id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};



// exports.enrollSlaveCrop = (userId, cropId, startDate, onCulscropID) => {
//     console.log("enrollSlaveCrop", userId, cropId, startDate, onCulscropID);
//     return new Promise((resolve, reject) => {
//         const sql = `
//       INSERT INTO slavecropcalendardays (
//         userId, cropCalendarId, taskIndex, startingDate, days, taskTypeEnglish, taskTypeSinhala, taskTypeTamil,
//         taskCategoryEnglish, taskCategorySinhala, taskCategoryTamil, taskEnglish, taskSinhala, taskTamil,
//         taskDescriptionEnglish, taskDescriptionSinhala, taskDescriptionTamil, status, imageLink, videoLinkEnglish,videoLinkSinhala,videoLinkTamil, reqImages, onCulscropID
//       )
//       SELECT ?, ccd.cropId, ccd.taskIndex, DATE_ADD(?, INTERVAL ccd.days DAY), ccd.days, ccd.taskTypeEnglish, ccd.taskTypeSinhala, ccd.taskTypeTamil,
//              ccd.taskCategoryEnglish, ccd.taskCategorySinhala, ccd.taskCategoryTamil, ccd.taskEnglish, ccd.taskSinhala,
//              ccd.taskTamil, ccd.taskDescriptionEnglish, ccd.taskDescriptionSinhala, ccd.taskDescriptionTamil, 'pending', ccd.imageLink, ccd.videoLinkEnglish, ccd.videoLinkSinhala, ccd.videoLinkTamil, ccd.reqImages, ?
//       FROM cropcalendardays ccd
//       WHERE ccd.cropId = ?;
//     `;
//         db.plantcare.query(sql, [userId, startDate, onCulscropID, cropId], (err, result) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(result);
//                 console.log("enrollSlaveCrop", result);
//             }
//         });
//     });
// };


// exports.enrollSlaveCrop = (userId, cropId, startDate, onCulscropID) => {
//   console.log("enrollSlaveCrop", userId, cropId, startDate, onCulscropID);
//   return new Promise((resolve, reject) => {
//     const fetchSql = `
//       SELECT * FROM cropcalendardays
//       WHERE cropId = ?
//       ORDER BY taskIndex ASC
//     `;

//     db.plantcare.query(fetchSql, [cropId], (err, rows) => {
//       if (err) return reject(err);

//       const tasks = rows;
//       const insertSql = `
//         INSERT INTO slavecropcalendardays (
//           userId, cropCalendarId, taskIndex, startingDate, days,
//           taskTypeEnglish, taskTypeSinhala, taskTypeTamil,
//           taskCategoryEnglish, taskCategorySinhala, taskCategoryTamil,
//           taskEnglish, taskSinhala, taskTamil,
//           taskDescriptionEnglish, taskDescriptionSinhala, taskDescriptionTamil,
//           status, imageLink, videoLinkEnglish, videoLinkSinhala, videoLinkTamil,
//           reqImages, onCulscropID
//         ) VALUES ?
//       `;

//       const start = new Date(startDate);
//       const values = [];
//       let currentDate = new Date(start);

//       tasks.forEach((task, index) => {
//         if (index === 0) {
//           currentDate = new Date(start.getTime() + task.days * 86400000);
//         } else {
//           currentDate = new Date(currentDate.getTime() + task.days * 86400000);
//         }

//         const formattedDate = currentDate.toISOString().split("T")[0];

//         values.push([
//           userId,
//           task.cropId,
//           task.taskIndex,
//           formattedDate,
//           task.days,
//           task.taskTypeEnglish,
//           task.taskTypeSinhala,
//           task.taskTypeTamil,
//           task.taskCategoryEnglish,
//           task.taskCategorySinhala,
//           task.taskCategoryTamil,
//           task.taskEnglish,
//           task.taskSinhala,
//           task.taskTamil,
//           task.taskDescriptionEnglish,
//           task.taskDescriptionSinhala,
//           task.taskDescriptionTamil,
//           'pending',
//           task.imageLink,
//           task.videoLinkEnglish,
//           task.videoLinkSinhala,
//           task.videoLinkTamil,
//           task.reqImages,
//           onCulscropID
//         ]);
//       });

//       db.plantcare.query(insertSql, [values], (insertErr, result) => {
//         if (insertErr) {
//           reject(insertErr);
//         } else {
//           console.log("Inserted tasks:", result);
//           resolve(result);
//         }
//       });
//     });
//   });
// };

exports.enrollSlaveCrop = (userId, cropId, startDate, onCulscropID) => {
    console.log("enrollSlaveCrop", userId, cropId, startDate, onCulscropID);
    return new Promise((resolve, reject) => {
        const fetchSql = `
      SELECT * FROM cropcalendardays
      WHERE cropId = ?
      ORDER BY taskIndex ASC
    `;

        db.plantcare.query(fetchSql, [cropId], (err, rows) => {
            if (err) return reject(err);

            const tasks = rows;
            const insertSql = `
        INSERT INTO slavecropcalendardays (
          userId, cropCalendarId, taskIndex, startingDate, days,
          taskTypeEnglish, taskTypeSinhala, taskTypeTamil,
          taskCategoryEnglish, taskCategorySinhala, taskCategoryTamil,
          taskEnglish, taskSinhala, taskTamil,
          taskDescriptionEnglish, taskDescriptionSinhala, taskDescriptionTamil,
          status, imageLink, videoLinkEnglish, videoLinkSinhala, videoLinkTamil,
          reqImages, onCulscropID, autoCompleted
        ) VALUES ?
      `;

            const start = new Date(startDate);
            const values = [];
            let currentDate = new Date(start);

            tasks.forEach((task, index) => {
                if (index === 0) {
                    currentDate = new Date(start.getTime() + task.days * 86400000);
                } else {
                    currentDate = new Date(currentDate.getTime() + task.days * 86400000);
                }
                const formattedDate = currentDate.toISOString().split("T")[0];
                const today = new Date().toISOString().split("T")[0];
                const status = formattedDate < today ? "completed" : "pending";
                const autoCompleted = formattedDate < today ? "1" : "0";

                values.push([
                    userId,
                    task.cropId,
                    task.taskIndex,
                    formattedDate,
                    task.days,
                    task.taskTypeEnglish,
                    task.taskTypeSinhala,
                    task.taskTypeTamil,
                    task.taskCategoryEnglish,
                    task.taskCategorySinhala,
                    task.taskCategoryTamil,
                    task.taskEnglish,
                    task.taskSinhala,
                    task.taskTamil,
                    task.taskDescriptionEnglish,
                    task.taskDescriptionSinhala,
                    task.taskDescriptionTamil,
                    status,
                    task.imageLink,
                    task.videoLinkEnglish,
                    task.videoLinkSinhala,
                    task.videoLinkTamil,
                    task.reqImages,
                    onCulscropID,
                    autoCompleted
                ]);
            });

            db.plantcare.query(insertSql, [values], (insertErr, result) => {
                if (insertErr) {
                    reject(insertErr);
                } else {
                    console.log("Inserted tasks:", result);
                    resolve(result);
                }
            });
        });
    });
};

exports.getSlaveCropCalendarDaysByUserAndCrop = (userId, cropCalendarId) => {
    return new Promise((resolve, reject) => {
        const sql = `
          SELECT * 
          FROM slavecropcalendardays 
          WHERE userId = ? AND cropCalendarId = ?
      `;
        db.plantcare.query(sql, [userId, cropCalendarId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.getSlaveCropCalendarPrgress = (userId, cropCalendarId) => {
    return new Promise((resolve, reject) => {
        const sql = `
        SELECT status
        FROM slavecropcalendardays 
        WHERE userId = ? AND cropCalendarId = ?
    `;
        db.plantcare.query(sql, [userId, cropCalendarId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

exports.getTaskById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT taskIndex, status, createdAt, cropCalendarId, days, startingDate, userId FROM slavecropcalendardays WHERE id = ?";
        db.plantcare.query(sql, [id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.getPreviousTasks = (taskIndex, cropCalendarId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
          SELECT id, taskIndex, createdAt, status , days, startingDate
          FROM slavecropcalendardays 
          WHERE taskIndex < ? AND cropCalendarId = ? AND userId = ? 
          ORDER BY taskIndex ASC`;
        db.plantcare.query(sql, [taskIndex, cropCalendarId, userId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.updateTaskStatus = (id, status) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE slavecropcalendardays SET status = ?, createdAt = CURRENT_TIMESTAMP WHERE id = ?";
        db.plantcare.query(sql, [status, id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.gettaskImagesByID = (slaveId) => {
    const query = "SELECT image FROM taskimages WHERE slaveId = ?";
    return new Promise((resolve, reject) => {
        db.plantcare.execute(query, [slaveId], (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                return reject(err);
            }
            resolve(result);
        });
    });
}

exports.deleteImagesBySlaveId = (slaveId) => {
    const query = "DELETE FROM taskimages WHERE slaveId = ?";
    return new Promise((resolve, reject) => {
        db.plantcare.execute(query, [slaveId], (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                return reject(err);
            }
            resolve(result);
        });
    });
};

// exports.deleteGeoLocationByTaskId = (id) => {
//     const sql = "DELETE FROM cropgeo WHERE taskId = ?";
//     return new Promise((resolve, reject) => {
//         db.plantcare.query(sql, [id], (err, results) => {
//             if (err) {
//                 reject(new Error("Error deleting geolocation: " + err.message));
//             } else {
//                 resolve(results);  
//             }
//         });
//     });
// };


// exports.addGeoLocation = (taskId,  longitude, latitude) => {
//     const sql = "INSERT INTO cropgeo(taskid, longitude, latitude) VALUES ( ?, ?, ?)";
//     return new Promise((resolve, reject) => {
//         db.plantcare.query(sql, [taskId,  longitude, latitude], (err, results) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(results);
//             }
//         });
//     });
// }
exports.addGeoLocation = (longitude, latitude, onCulscropID) => {
    const sql = "UPDATE ongoingcultivationscrops SET longitude = ?, latitude = ? WHERE id = ?";
    return new Promise((resolve, reject) => {
        db.plantcare.query(sql, [longitude, latitude, onCulscropID], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}


exports.checkTaskExists = (taskId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT COUNT(*) AS count
            FROM slavecropcalendardays
            WHERE id = ?;
        `;

        db.plantcare.execute(query, [taskId], (err, results) => {
            if (err) {
                reject(new Error("Error checking task existence: " + err.message));
            } else {
                resolve(results[0].count > 0);
            }
        });
    });
};

exports.getUploadedImagesCount = (userId, cropId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT COUNT(*) as count
            FROM taskimages ti
            JOIN slavecropcalendardays scc ON ti.slaveId = scc.id
            WHERE scc.userId = ? AND scc.id= ?
        `;
        db.plantcare.query(sql, [userId, cropId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });

    });
}

// hrg
