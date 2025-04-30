const db = require("../startup/database");

exports.getTransactionHistoryByUserIdAndDate = (userId, date) => {
  console.log('DAO: getTransactionHistoryByUserIdAndDate', userId, date);
  return new Promise((resolve, reject) => {
    const query = `
          SELECT
              RFP.id AS registeredFarmerId,
              RFP.collectionOfficerId,
              RFP.invNo,
              U.id AS userId,
              U.firstName,
              U.lastName,
              U.phoneNumber,
              U.profileImage,
              CONCAT_WS(', ', U.houseNo, U.streetName, U.city, U.district) AS address,
              U.NICnumber,
              SUM(FPC.gradeAprice * FPC.gradeAquan) +
              SUM(FPC.gradeBprice * FPC.gradeBquan) +
              SUM(FPC.gradeCprice * FPC.gradeCquan) AS totalAmount,
              /* Count the number of records in farmerpaymentscrops for this registered farmer */
              COUNT(FPC.id) AS cropRecordCount,
              UB.accNumber AS accountNumber,
              UB.accHolderName AS accountHolderName,
              UB.bankName AS bankName,
              UB.branchName AS branchName,
              CO.empId,
              CO.centerId,
              CO.companyId,
              DATE(RFP.createdAt) AS transactionDate
          FROM registeredfarmerpayments RFP
          INNER JOIN farmerpaymentscrops FPC ON FPC.registerFarmerId = RFP.id
          INNER JOIN plant_care.users U ON RFP.userId = U.id
          LEFT JOIN \`plant_care\`.userbankdetails UB ON U.id = UB.userId
          INNER JOIN collectionofficer CO ON RFP.collectionOfficerId = CO.id  
          WHERE U.id = ?
            AND DATE(RFP.createdAt) = ?
          GROUP BY
              RFP.id,
              RFP.collectionOfficerId,
              RFP.invNo,
              U.id,
              U.firstName,
              U.lastName,
              U.phoneNumber,
              U.profileImage,
              CONCAT_WS(', ', U.houseNo, U.streetName, U.city, U.district),
              U.NICnumber,
              UB.accNumber,
              UB.accHolderName,
              UB.bankName,
              UB.branchName,
              CO.empId,
              CO.centerId,
              CO.companyId,
              DATE(RFP.createdAt)
      `;
    db.collectionofficer.query(query, [userId, date], (error, results) => {
      if (error) {
        return reject(error);
      }
      console.log('Result of transaction history:', results);
      resolve(results);
    });
  });
};

exports.getUserWithBankDetailsById = async (userId, centerId, companyId) => {
  const query = `
      SELECT
          u.id AS userId,
          u.firstName,
          u.lastName,
          u.phoneNumber,
          u.NICnumber,
          u.profileImage,
          u.farmerQr,
          b.accNumber,
          b.accHolderName,
          b.bankName,
          b.branchName,
          c.companyNameEnglish,
          cc.centerName,
          b.createdAt
      FROM users u
      LEFT JOIN userbankdetails b ON u.id = b.userId
      LEFT JOIN collection_officer.company c ON c.id = ?
      LEFT JOIN collection_officer.collectioncenter cc ON cc.id = ?
      WHERE u.id = ?;
  `;
 
  return new Promise((resolve, reject) => {
      db.plantcare.query(query, [companyId, centerId, userId], (err, result) => {
          if (err) return reject(err);
          resolve(result);
          console.log(result);
      });
  });
};

exports.GetFarmerReportDetailsDao = async (userId, createdAtDate, registeredFarmerId) => {
  const query = `
    SELECT
      fpc.id AS id,
      cg.cropNameEnglish AS cropName,
      cg.cropNameSinhala,
      cg.cropNameTamil,
      cv.varietyNameEnglish AS variety,
      cv.varietyNameSinhala,
      cv.varietyNameTamil,
      fpc.gradeAprice AS unitPriceA,
      fpc.gradeAquan AS weightA,
      fpc.gradeBprice AS unitPriceB,
      fpc.gradeBquan AS weightB,
      fpc.gradeCprice AS unitPriceC,
      fpc.gradeCquan AS weightC,
      rfp.InvNo AS invoiceNumber
    FROM
      farmerpaymentscrops fpc
    INNER JOIN
      plant_care.cropvariety cv ON fpc.cropId = cv.id
    INNER JOIN
      plant_care.cropgroup cg ON cv.cropGroupId = cg.id
    INNER JOIN
      registeredfarmerpayments rfp ON fpc.registerFarmerId = rfp.id
    WHERE
      rfp.userId = ? 
      AND fpc.registerFarmerId = ?
      AND DATE(fpc.createdAt) = ?
    ORDER BY
      fpc.createdAt DESC
  `;
  return new Promise((resolve, reject) => {
   
    console.log('@@@@@@@@ UserId:', userId);
    console.log('@@@@@@@@@   registeredFarmerId:', registeredFarmerId);
    console.log('@@@@@@@@@   createdAtDate:', createdAtDate);
   
    db.collectionofficer.query(query, [userId, registeredFarmerId, createdAtDate], (error, results) => {
      if (error) return reject(error);
      const transformedResults = results.flatMap(row => {
        const entries = [];
       
        if (row.weightA > 0) entries.push({
          id: row.id,
          cropName: row.cropName,
          cropNameSinhala: row.cropNameSinhala,
          cropNameTamil: row.cropNameTamil,
          varietyNameSinhala: row.varietyNameSinhala,
          varietyNameTamil: row.varietyNameTamil,
          variety: row.variety,
          grade: 'A',
          unitPrice: row.unitPriceA,
          quantity: row.weightA,
          subTotal: (row.unitPriceA * row.weightA).toFixed(2),
          invoiceNumber: row.invoiceNumber
        });
        if (row.weightB > 0) entries.push({
          id: row.id,
          cropName: row.cropName,
          cropNameSinhala: row.cropNameSinhala,
          cropNameTamil: row.cropNameTamil,
          varietyNameSinhala: row.varietyNameSinhala,
          varietyNameTamil: row.varietyNameTamil,
          variety: row.variety,
          grade: 'B',
          unitPrice: row.unitPriceB,
          quantity: row.weightB,
          subTotal: (row.unitPriceB * row.weightB).toFixed(2),
          invoiceNumber: row.invoiceNumber
        });
        if (row.weightC > 0) entries.push({
          id: row.id,
          cropName: row.cropName,
          cropNameSinhala: row.cropNameSinhala,
          cropNameTamil: row.cropNameTamil,
          varietyNameSinhala: row.varietyNameSinhala,
          varietyNameTamil: row.varietyNameTamil,
          variety: row.variety,
          grade: 'C',
          unitPrice: row.unitPriceC,
          quantity: row.weightC,
          subTotal: (row.unitPriceC * row.weightC).toFixed(2),
          invoiceNumber: row.invoiceNumber
        });
        return entries;
      });
      console.log('Transformed Results:', transformedResults);
      resolve(transformedResults);
    });
  });
};
