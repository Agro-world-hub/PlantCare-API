const db = require("../startup/database");

exports.createComplain = (farmerId, language, complain, category, status) => {
    return new Promise((resolve, reject) => {
        const sql =
            "INSERT INTO farmercomplains (farmerId,  language, complain, complainCategory, status) VALUES (?, ?, ?, ?, ?)";
        db.collectionofficer.query(sql, [farmerId, language, complain, category, status], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
};

exports.getAllComplaintsByUserId = async(userId) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT id, language, complain, status, createdAt, complainCategory , reply
        FROM farmercomplains 
        WHERE farmerId = ?
        ORDER BY createdAt DESC
      `;
        db.collectionofficer.query(query, [userId], (error, results) => {
            if (error) {
                console.error("Error fetching complaints:", error);
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};