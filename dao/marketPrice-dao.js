const asyncHandler = require("express-async-handler");

const db = require('../startup/database');

// const getAllMarketData = (userId) => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//     SELECT 
//       mp.varietyId, 
//       mp.price, 
//       mp.grade,
//       cv.varietyNameEnglish,
//       cv.varietyNameSinhala,
//       cv.varietyNameTamil,
//       cv.bgColor,
//       cv.image
//     FROM ongoingcultivations oc
//     JOIN ongoingcultivationscrops ocs ON oc.id = ocs.ongoingCultivationId 
//     JOIN cropcalender cc ON ocs.cropCalendar = cc.id
//     JOIN cropvariety cv ON cc.cropVarietyId = cv.id
//     JOIN marketprice mp ON cv.id = mp.varietyId
//     WHERE oc.userId = ?;
//   `;

//     db.query(sql, [userId] ,(err, results) => {
//       if (err) {
//         reject('Error executing query: ' + err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };
const getAllMarketData = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
    SELECT 
      mp.varietyId, 
      mp.price, 
      mp.grade,
      cv.varietyNameEnglish,
      cv.varietyNameSinhala,
      cv.varietyNameTamil,
      cv.bgColor,
      cv.image
    FROM ongoingcultivations oc
    JOIN ongoingcultivationscrops ocs ON oc.id = ocs.ongoingCultivationId 
    JOIN cropcalender cc ON ocs.cropCalendar = cc.id
    JOIN cropvariety cv ON cc.cropVarietyId = cv.id
    JOIN collection_officer.marketprice mp ON cv.id = mp.varietyId
    WHERE oc.userId = ?;
    `;

    db.plantcare.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Query Error:', err.message);
        reject(new Error('Error executing query. Check logs for details.'));
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  getAllMarketData,
};
