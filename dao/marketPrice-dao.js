const asyncHandler = require("express-async-handler");

const db = require('../startup/database');

const getAllMarketData = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM marketprice';
    db.query(sql, (err, results) => {
      if (err) {
        reject('Error executing query: ' + err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  getAllMarketData,
};
