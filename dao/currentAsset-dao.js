// // dao/currentAssets-dao.js

// const db = require("../startup/database"); // Import database connection

// // DAO function to fetch current assets grouped by category for a specific user
// exports.getAllCurrentAssets = (userId) => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//             SELECT category, SUM(total) AS totalSum 
//             FROM currentasset 
//             WHERE userId = ? 
//             GROUP BY category
//         `;
//     db.query(sql, [userId], (err, results) => {
//       if (err) {
//         return reject(err); // Reject with error if there's a DB issue
//       }
//       resolve(results); // Return the fetched results
//     });
//   });
// };

// // DAO function to fetch assets by user ID and category (or categories)
// exports.getAssetsByCategory = (userId, category) => {
//   return new Promise((resolve, reject) => {
//     let query;
//     let values;

//     // If category is an array, handle it accordingly
//     if (Array.isArray(category)) {
//       // Create placeholders for the number of categories in the array
//       const placeholders = category.map(() => "?").join(",");
//       query = `SELECT * FROM currentasset WHERE userId = ? AND category IN (${placeholders})`;
//       values = [userId, ...category];
//     } else {
//       // Handle single category
//       query = "SELECT * FROM currentasset WHERE userId = ? AND category = ?";
//       values = [userId, category];
//     }

//     // Query the database
//     db.query(query, values, (err, results) => {
//       if (err) {
//         return reject(err); // If a database error occurs, reject the promise
//       }
//       resolve(results); // Resolve with the query results
//     });
//   });
// };

// //for delete current assets

// // DAO function to retrieve the current asset by user ID, category, and asset ID
// exports.getCurrentAsset = (userId, category, assetId) => {
//   return new Promise((resolve, reject) => {
//     const query =
//       "SELECT * FROM currentasset WHERE userId = ? AND category = ? AND id = ?";
//     db.execute(query, [userId, category, assetId], (err, results) => {
//       if (err) {
//         return reject(err); // Reject if there's a database error
//       }
//       resolve(results); // Resolve with the results
//     });
//   });
// };

// // DAO function to delete an asset by user ID, category, and asset ID
// exports.deleteAsset = (userId, category, assetId) => {
//   return new Promise((resolve, reject) => {
//     const query =
//       "DELETE FROM currentasset WHERE userId = ? AND category = ? AND id = ?";
//     db.execute(query, [userId, category, assetId], (err) => {
//       if (err) {
//         return reject(err); // Reject if there's a database error
//       }
//       resolve(); // Resolve if deletion was successful
//     });
//   });
// };

// // DAO function to update an asset
// exports.updateAsset = (userId, category, assetId, newNumOfUnit, newTotal) => {
//   return new Promise((resolve, reject) => {
//     const query =
//       "UPDATE currentasset SET numOfUnit = ?, total = ? WHERE userId = ? AND category = ? AND id = ?";
//     db.execute(
//       query,
//       [newNumOfUnit, newTotal, userId, category, assetId],
//       (err) => {
//         if (err) {
//           return reject(err); // Reject if there's a database error
//         }
//         resolve(); // Resolve if update was successful
//       }
//     );
//   });
// };

// // DAO function to insert a record into currentassetrecord
// exports.insertRecord = (
//   currentAssetId,
//   numOfPlusUnit,
//   numOfMinUnit,
//   totalPrice
// ) => {
//   return new Promise((resolve, reject) => {
//     const query =
//       "INSERT INTO currentassetrecord (currentAssetId, numOfPlusUnit, numOfMinUnit, totalPrice) VALUES (?, ?, ?, ?)";
//     db.execute(
//       query,
//       [currentAssetId, numOfPlusUnit, numOfMinUnit, totalPrice],
//       (err) => {
//         if (err) {
//           return reject(err); // Reject if there's a database error
//         }
//         resolve(); // Resolve if insertion was successful
//       }
//     );
//   });
// };


// dao/currentAssets-dao.js

const db = require("../startup/database"); // Import database connection

// DAO function to fetch current assets grouped by category for a specific user
exports.getAllCurrentAssets = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
            SELECT category, SUM(total) AS totalSum 
            FROM currentasset 
            WHERE userId = ? 
            GROUP BY category
        `;
    db.query(sql, [userId], (err, results) => {
      if (err) {
        return reject(err); // Reject with error if there's a DB issue
      }
      resolve(results); // Return the fetched results
    });
  });
};

// DAO function to fetch assets by user ID and category (or categories)
exports.getAssetsByCategory = (userId, category) => {
  return new Promise((resolve, reject) => {
    let query;
    let values;

    // If category is an array, handle it accordingly
    if (Array.isArray(category)) {
      // Create placeholders for the number of categories in the array
      const placeholders = category.map(() => "?").join(",");
      query = `SELECT * FROM currentasset WHERE userId = ? AND category IN (${placeholders})`;
      values = [userId, ...category];
    } else {
      // Handle single category
      query = "SELECT * FROM currentasset WHERE userId = ? AND category = ?";
      values = [userId, category];
    }

    // Query the database
    db.query(query, values, (err, results) => {
      if (err) {
        return reject(err); // If a database error occurs, reject the promise
      }
      resolve(results); // Resolve with the query results
    });
  });
};

//for delete current assets

// DAO function to retrieve the current asset by user ID, category, and asset ID
exports.getCurrentAsset = (userId, category, assetId) => {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT * FROM currentasset WHERE userId = ? AND category = ? AND id = ?";
    db.execute(query, [userId, category, assetId], (err, results) => {
      if (err) {
        return reject(err); // Reject if there's a database error
      }
      resolve(results); // Resolve with the results
    });
  });
};

// DAO function to delete an asset by user ID, category, and asset ID
exports.deleteAsset = (userId, category, assetId) => {
  return new Promise((resolve, reject) => {
    const query =
      "DELETE FROM currentasset WHERE userId = ? AND category = ? AND id = ?";
    db.execute(query, [userId, category, assetId], (err) => {
      if (err) {
        return reject(err); // Reject if there's a database error
      }
      resolve(); // Resolve if deletion was successful
    });
  });
};

// DAO function to update an asset
exports.updateAsset = (userId, category, assetId, newNumOfUnit, newTotal) => {
  return new Promise((resolve, reject) => {
    const query =
      "UPDATE currentasset SET numOfUnit = ?, total = ? WHERE userId = ? AND category = ? AND id = ?";
    db.execute(
      query,
      [newNumOfUnit, newTotal, userId, category, assetId],
      (err) => {
        if (err) {
          return reject(err); // Reject if there's a database error
        }
        resolve(); // Resolve if update was successful
      }
    );
  });
};

// DAO function to insert a record into currentassetrecord
exports.insertRecord = (
  currentAssetId,
  numOfPlusUnit,
  numOfMinUnit,
  totalPrice
) => {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO currentassetrecord (currentAssetId, numOfPlusUnit, numOfMinUnit, totalPrice) VALUES (?, ?, ?, ?)";
    db.execute(
      query,
      [currentAssetId, numOfPlusUnit, numOfMinUnit, totalPrice],
      (err) => {
        if (err) {
          return reject(err); // Reject if there's a database error
        }
        resolve(); // Resolve if insertion was successful
      }
    );
  });
};

/////

// Check if an asset exists for a user in a given category
exports.checkExistingAsset = (userId, category, asset) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM currentasset WHERE userId = ? AND category = ? AND asset = ?";
    db.query(sql, [userId, category, asset], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Update existing asset
exports.updateExistingAsset = (
  existingAsset,
  numberOfUnits,
  totalPrice,
  volume,
  unitPrice,
  purchaseDate,
  expireDate,
  status
) => {
  return new Promise((resolve, reject) => {
    const updatedNumOfUnits = existingAsset.numOfUnit + numberOfUnits;
    const updatedTotalPrice = existingAsset.total + totalPrice;

    const updateSql = `
            UPDATE currentasset
            SET numOfUnit = ?, total = ?, unitVolume = ?, unitPrice = ?, purchaseDate = ?, expireDate = ?, status = ?
            WHERE id = ?
        `;
    const updateValues = [
      updatedNumOfUnits,
      updatedTotalPrice,
      volume,
      unitPrice,
      purchaseDate,
      expireDate,
      status,
      existingAsset.id,
    ];

    db.query(updateSql, updateValues, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

// Insert new asset
exports.addNewAsset = (
  userId,
  category,
  asset,
  brand,
  batchNum,
  unit,
  volume,
  numberOfUnits,
  unitPrice,
  totalPrice,
  purchaseDate,
  expireDate,
  status
) => {
  return new Promise((resolve, reject) => {
    const insertSql = `
            INSERT INTO currentasset (userId, category, asset, brand, batchNum, unit, unitVolume, numOfUnit, unitPrice, total, purchaseDate, expireDate, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const insertValues = [
      userId,
      category,
      asset,
      brand,
      batchNum,
      unit,
      volume,
      numberOfUnits,
      unitPrice,
      totalPrice,
      purchaseDate,
      expireDate,
      status,
    ];

    db.query(insertSql, insertValues, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};

// Insert asset record into currentassetrecord
exports.insertAssetRecord = (currentAssetId, numOfUnits, totalPrice) => {
  return new Promise((resolve, reject) => {
    const recordSql = `
            INSERT INTO currentassetrecord (currentAssetId, numOfPlusUnit, numOfMinUnit, totalPrice)
            VALUES (?, ?, 0, ?)
        `;
    const recordValues = [currentAssetId, numOfUnits, totalPrice];

    db.query(recordSql, recordValues, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};
