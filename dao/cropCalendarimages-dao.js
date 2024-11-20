const db = require('../startup/database'); // Import the database connection

/**
 * Inserts an image along with the slaveId into the taskimages table.
 * @param {number} slaveId - The slave ID to associate with the image.
 * @param {Buffer} image - The image data in Buffer format.
 * @returns {Promise} - A promise that resolves when the image is inserted.
 */
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

module.exports = {
    insertTaskImage
};