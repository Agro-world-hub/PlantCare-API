const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const asyncHandler = require("express-async-handler");

exports.getCropByCategory = (categorie) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM cropCalender WHERE Category=?";
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
    const sql = "SELECT * FROM cropCalender WHERE id = ?";
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
        FROM ongoingCultivations oc, ongoingCultivationsCrops ocr, cropcalendardays cd 
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
  const sql = "SELECT id FROM ongoingCultivations WHERE userId = ?";
  return query(sql, [userId]);
};

// Create a new ongoing cultivation for the user
exports.createOngoingCultivation = (userId) => {
  const sql = "INSERT INTO ongoingCultivations(userId) VALUES (?)";
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
  const sql = "INSERT INTO ongoingCultivationsCrops(ongoingCultivationId, cropCalendar) VALUES (?, ?)";
  return query(sql, [cultivationId, cropId]);
};