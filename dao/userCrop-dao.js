const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const asyncHandler = require("express-async-handler");

exports.getCropByCategory = (categorie) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM cropcalender WHERE Category=?";
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
exports.getCropById = (cropId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM cropcalender WHERE id = ?";
    db.query(sql, [cropId], (err, results) => {
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

exports.getOngoingCultivationsByUserId = (userId, callback) => {
  const sql = `
    SELECT * 
    FROM ongoingcultivations c 
    JOIN ongoingcultivationscrops oc ON c.id = oc.ongoingCultivationId
    JOIN cropcalender cr ON oc.cropCalendar = cr.id 
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
  const sql = "SELECT cropCalendar FROM ongoingcultivationscrops WHERE ongoingCultivationId = ?";
  return query(sql, [cultivationId]);
};

// Enroll the crop into the ongoing cultivation
exports.enrollOngoingCultivationCrop = (cultivationId, cropId) => {
  const sql = "INSERT INTO ongoingcultivationscrops(ongoingCultivationId, cropCalendar) VALUES (?, ?)";
  return query(sql, [cultivationId, cropId]);
};

exports.enrollSlaveCrop = (userId, cropId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO slavecropcalendardays (
        userId, cropCalendarId, taskIndex, days, taskTypeEnglish, taskTypeSinhala, taskTypeTamil,
        taskCategoryEnglish, taskCategorySinhala, taskCategoryTamil, taskEnglish, taskSinhala, taskTamil,
        taskDescriptionEnglish, taskDescriptionSinhala, taskDescriptionTamil, status
      )
      SELECT ?, ccd.cropId, ccd.taskIndex, ccd.days, ccd.taskTypeEnglish, ccd.taskTypeSinhala, ccd.taskTypeTamil,
             ccd.taskCategoryEnglish, ccd.taskCategorySinhala, ccd.taskCategoryTamil, ccd.taskEnglish, ccd.taskSinhala,
             ccd.taskTamil, ccd.taskDescriptionEnglish, ccd.taskDescriptionSinhala, ccd.taskDescriptionTamil, 'pending'
      FROM cropcalendardays ccd
      WHERE ccd.cropId = ?;
    `;
    db.query(sql, [userId, cropId], (err, result) => {
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

//slave calender-status update
exports.getTaskById = (id) => {
  return new Promise((resolve, reject) => {
      const sql = "SELECT taskIndex, status, createdAt, cropCalendarId, userId FROM slavecropcalendardays WHERE id = ?";
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
          SELECT id, taskIndex, createdAt, status 
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
