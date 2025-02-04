const db = require("../startup/database");

exports.createComplain = (farmerId, language, complain, category, status,referenceNumber) => {
    return new Promise((resolve, reject) => {
        const sql =
            "INSERT INTO farmercomplains (farmerId,  language, complain, complainCategory, status, refNo, adminStatus) VALUES (?, ?, ?, ?, ?, ?, 'Assigned')";
        db.collectionofficer.query(sql, [farmerId, language, complain, category, status, referenceNumber], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
};

exports.countComplaintsByDate = async (date) => {
    const formattedDate = date.toISOString().split('T')[0]; // Convert date to YYYY-MM-DD

    // Return a promise that resolves the count
    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) AS count FROM farmercomplains WHERE DATE(createdAt) = ?`;
        db.collectionofficer.query(query, [formattedDate], (error, results) => {
            if (error) {
                console.error("Error fetching complaints:", error);
                reject(error);  // Reject the promise on error
            } else {
                resolve(results[0].count);  // Resolve the promise with the count
            }
        });
    });
};


exports.getAllComplaintsByUserId = async(userId) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT id, language, complain, status, createdAt, complainCategory , reply, refNo
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