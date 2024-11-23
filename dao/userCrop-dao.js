const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const asyncHandler = require("express-async-handler");

exports.getCropByCategory = (categorie) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM cropgroup WHERE category=?";
    db.query(sql, [categorie], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Function to get crop details by crop ID
exports.getCropVariety = (cropId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM cropvariety WHERE cropGroupId = ?";
    db.query(sql, [cropId], (err, results) => {
      if (err) {
        reject(err); // Return the error if the query fails
      } else {
        resolve(results); // Return the results if successful
      }
    });
  });
};

exports.getCropCalenderDetails = (id,method, naofcul) => {
  return new Promise((resolve, reject) => {

    const sql = `SELECT * FROM cropcalender WHERE cropVarietyId = ? AND method = ? AND natOfCul = ?`;

    // Execute the query
    db.query(sql, [id, method, naofcul], (err, results) => {
      if (err) {
        reject(err); // Return the error if the query fails
      } else {
        resolve(results); // Return the results if successful
      }
    });
  });
};


// Function to fetch the crop calendar feed based on userId and cropId
exports.getCropCalendarFeed = (userId, cropId) => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT * 
        FROM ongoingcultivations oc, ongoingcultivationscrops ocr, cropcalendardays cd 
        WHERE oc.id = ocr.ongoingCultivationId 
        AND ocr.cropCalendar = cd.cropId 
        AND oc.userId = ? 
        AND cd.cropId = ?`;

    db.query(sql, [userId, cropId], (err, results) => {
      if (err) {
        reject(err); // Reject the promise with error
      } else {
        resolve(results); // Resolve with the query results
      }
    });
  });
};

// exports.getOngoingCultivationsByUserId = (userId, callback) => {
//   const sql = `
//     SELECT 
//   oc.id AS ongoingcultivationscropsId,
//   c.*,               
//   oc.*,             
//   cr.*               
// FROM ongoingcultivations c
// LEFT JOIN ongoingcultivationscrops oc ON c.id = oc.ongoingCultivationId
// LEFT JOIN cropvariety cr ON oc.cropCalendar = cr.id
// WHERE c.userId = ?;
//   `;
//   db.query(sql, [userId], (err, results) => {
//     if (err) {
//       console.error("Database error:", err);
//       return callback(err, null);
//     }
//     callback(null, results);
//   });
// };

exports.getOngoingCultivationsByUserId = (userId, callback) => {
  const sql = `
    SELECT * 
    FROM ongoingcultivations c 
    JOIN ongoingcultivationscrops oc ON c.id = oc.ongoingCultivationId
    JOIN cropcalender cc ON oc.cropCalendar = cc.id
    JOIN cropvariety cr ON cc.cropVarietyId = cr.id 
    WHERE c.userId = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return callback(err, null);
    }
    callback(null, results);
  });
};


// Generic query function for database operations
//for enroll only
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

// Check if the user has an ongoing cultivation
exports.checkOngoingCultivation = (userId) => {
  const sql = "SELECT id FROM ongoingcultivations WHERE userId = ?";
  return query(sql, [userId]);
};

// Create a new ongoing cultivation for the user
exports.createOngoingCultivation = (userId) => {
  const sql = "INSERT INTO ongoingcultivations(userId) VALUES (?)";
  return query(sql, [userId]);
};

// Check the crop count for the given cultivation
exports.checkCropCount = (cultivationId) => {
  const sql = "SELECT COUNT(id) as count FROM ongoingcultivationscrops WHERE ongoingCultivationId = ?";
  return query(sql, [cultivationId]);
};

// Check if the crop is already enrolled for the cultivation
exports.checkEnrollCrop = (cultivationId) => {
  const sql = "SELECT cropCalendar, id FROM ongoingcultivationscrops WHERE ongoingCultivationId = ?";
  return query(sql, [cultivationId]);
};

// Enroll the crop into the ongoing cultivation
exports.enrollOngoingCultivationCrop = (cultivationId, cropId, extent, startDate ) => {
  const sql = "INSERT INTO ongoingcultivationscrops(ongoingCultivationId, cropCalendar,  extent , startedAt) VALUES (?, ?,?,?)";
  return query(sql, [cultivationId, cropId, extent, startDate]);
};

exports.getEnrollOngoingCultivationCrop = (cultivationId) => {
  const sql = `
    SELECT cropCalendar, id 
    FROM ongoingcultivationscrops 
    WHERE ongoingCultivationId = ?
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, [cultivationId], (err, results) => {
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
  const sql = `
    SELECT * 
    FROM ongoingcultivationscrops 
    WHERE id = ?
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error("Database error in ongoingcultivationscrops:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.updateOngoingCultivationCrop = (onCulscropID, extent, formattedStartDate) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE ongoingcultivationscrops SET extent = ?, startedAt = ? WHERE id = ?";
    db.query(sql, [extent, formattedStartDate, onCulscropID], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Fetch days related to onCulscropID from slavecropcalendardays table
exports.getSlaveCropCalendarDays = (onCulscropID) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, days FROM slavecropcalendardays WHERE onCulscropID = ?";
    db.query(sql, [onCulscropID], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Update the starting date in the slavecropcalendardays table
exports.updateSlaveCropCalendarDay = (id, formattedDate) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE slavecropcalendardays SET startingDate = ? WHERE id = ?";
    db.query(sql, [formattedDate, id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};



exports.enrollSlaveCrop = (userId, cropId, startDate, onCulscropID) => {
  console.log("enrollSlaveCrop", userId, cropId, startDate, onCulscropID);
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO slavecropcalendardays (
        userId, cropCalendarId, taskIndex, startingDate, days, taskTypeEnglish, taskTypeSinhala, taskTypeTamil,
        taskCategoryEnglish, taskCategorySinhala, taskCategoryTamil, taskEnglish, taskSinhala, taskTamil,
        taskDescriptionEnglish, taskDescriptionSinhala, taskDescriptionTamil, status, imageLink, videoLink, reqImages, onCulscropID
      )
      SELECT ?, ccd.cropId, ccd.taskIndex, DATE_ADD(?, INTERVAL ccd.days DAY), ccd.days, ccd.taskTypeEnglish, ccd.taskTypeSinhala, ccd.taskTypeTamil,
             ccd.taskCategoryEnglish, ccd.taskCategorySinhala, ccd.taskCategoryTamil, ccd.taskEnglish, ccd.taskSinhala,
             ccd.taskTamil, ccd.taskDescriptionEnglish, ccd.taskDescriptionSinhala, ccd.taskDescriptionTamil, 'pending', ccd.imageLink, ccd.videoLink, ccd.reqImages, ?
      FROM cropcalendardays ccd
      WHERE ccd.cropId = ?;
    `;
    db.query(sql, [userId, startDate, onCulscropID, cropId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};



//slave calender
exports.getSlaveCropCalendarDaysByUserAndCrop = (userId, cropCalendarId) => {
  return new Promise((resolve, reject) => {
      const sql = `
          SELECT * 
          FROM slavecropcalendardays 
          WHERE userId = ? AND cropCalendarId = ?
      `;
      db.query(sql, [userId, cropCalendarId], (err, results) => {
          if (err) {
              reject(err);
          } else {
              resolve(results);
          }
      });
  });
};

exports.getSlaveCropCalendarPrgress = (userId,cropCalendarId) => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT status
        FROM slavecropcalendardays 
        WHERE userId = ? AND cropCalendarId = ?
    `;
    db.query(sql, [userId, cropCalendarId], (err, results) => {
        if (err) {
            reject(err);
        } else {
            resolve(results);
        }
    });
});
}

//slave calender-status update
exports.getTaskById = (id) => {
  return new Promise((resolve, reject) => {
      const sql = "SELECT taskIndex, status, createdAt, cropCalendarId, days, startingDate, userId FROM slavecropcalendardays WHERE id = ?";
      db.query(sql, [id], (err, results) => {
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
          SELECT id, taskIndex, createdAt, status , days
          FROM slavecropcalendardays 
          WHERE taskIndex < ? AND cropCalendarId = ? AND userId = ? 
          ORDER BY taskIndex ASC`;
      db.query(sql, [taskIndex, cropCalendarId, userId], (err, results) => {
          if (err) {
              reject(err);
          } else {
              resolve(results);
          }
      });
  });
};

// exports.getNextTask = (taskIndex, cropCalendarId, userId) => {
//   return new Promise((resolve, reject) => {
//       const sql = `
//           SELECT id, taskIndex, createdAt, status , days
//           FROM slavecropcalendardays 
//           WHERE taskIndex = ? AND cropCalendarId = ? AND userId = ? 
//           ORDER BY taskIndex ASC`;
//       db.query(sql, [taskIndex, cropCalendarId, userId], (err, results) => {
//           if (err) {
//               reject(err);
//           } else {
//               resolve(results);
//           }
//       });
//   });
// };

exports.updateTaskStatus = (id, status) => {
  return new Promise((resolve, reject) => {
      const sql = "UPDATE slavecropcalendardays SET status = ?, createdAt = CURRENT_TIMESTAMP WHERE id = ?";
      db.query(sql, [status, id], (err, results) => {
          if (err) {
              reject(err);
          } else {
              resolve(results);
          }
      });
  });
};


