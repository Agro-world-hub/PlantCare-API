// const db = require('../startup/database'); // Ensure to import your database connection

// exports.createPost = (userId, chatHeadingId, chatId, heading, message) => {
//     return new Promise((resolve, reject) => {
//         const sql = 'INSERT INTO publicforumposts (userId, chatHeadingId, chatId, heading, message) VALUES (?, ?, ?, ?, ?)';
//         db.query(sql, [userId, chatHeadingId, chatId, heading, message], (err, result) => {
//             if (err) {
//                 return reject(err); // Reject on error
//             }
//             resolve(result.insertId); // Resolve with the ID of the newly created post
//         });
//     });
// };


// just started. has a issue with table
