// SlaveCropCalendarDAO.js
const db = require('../startup/database'); // Ensure this imports your database connection

// Method to get the required images for a specific cropId
const getRequiredImages = (cropId) => {
    return new Promise((resolve, reject) => {
        // SQL query to fetch the 'reqImages' field from slavecropcalendardays table
        const query = `
      SELECT reqImages
      FROM slavecropcalendardays
      WHERE id = ?
      LIMIT 1;
    `;

        // Execute the query
        db.execute(query, [cropId], (err, results) => {
            if (err) {
                reject(new Error('Error fetching required images: ' + err.message));
            } else {
                if (results.length > 0) {
                    resolve(results[0].reqImages); // Return the 'reqImages' value if found
                } else {
                    resolve(null); // If no record is found, return null
                }
            }
        });
    });
};

// Method to insert a task image into the 'taskimages' table
const insertTaskImage = (slaveId, image) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO taskimages (slaveId, image) VALUES (?, ?)';

        db.query(query, [slaveId, image], (err, result) => {
            if (err) {
                reject(new Error('Error inserting image into taskimages: ' + err.message));
            } else {
                resolve(result);
            }
        });
    });
};

// Exporting the methods
module.exports = {
    getRequiredImages,
    insertTaskImage,
};