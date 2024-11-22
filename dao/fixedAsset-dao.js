const db = require("../startup/database"); 

exports.getFixedAssetsByCategoryAndUser = (category, userId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM fixedasset WHERE category = ? AND userId = ?";

    db.query(sql, [category, userId], (err, results) => {
      if (err) {
        reject(err); 
      } else {
        resolve(results); 
      }
    });
  });
};

exports.deleteFixedAsset = (idArray) => {
  return new Promise((resolve, reject) => {
    const deleteSql = `DELETE FROM fixedasset WHERE id IN (?)`;
    db.query(deleteSql, [idArray], (err, result) => {
      if (err) {
        return reject(err); 
      }
      resolve(result); 
    });
  });
};


