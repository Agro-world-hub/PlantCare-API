// dao/fixedAssets-dao.js

const db = require("../startup/database"); // Import the database connection

// Function to get fixed assets by category and user from the database
exports.getFixedAssetsByCategoryAndUser = (category, userId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM fixedasset WHERE category = ? AND userId = ?";

    db.query(sql, [category, userId], (err, results) => {
      if (err) {
        reject(err); // Return the error if query fails
      } else {
        resolve(results); // Resolve with the query results
      }
    });
  });
};

// Function to delete fixed assets by ID(s)
exports.deleteFixedAsset = (idArray) => {
  return new Promise((resolve, reject) => {
    const deleteSql = `DELETE FROM fixedasset WHERE id IN (?)`;
    db.query(deleteSql, [idArray], (err, result) => {
      if (err) {
        return reject(err); // Error handling for query
      }
      resolve(result); // Resolving with result of deletion
    });
  });
};


