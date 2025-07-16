const db = require("../startup/database");

// exports.getPaginatedPosts = (limit, offset) => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//             SELECT 
//                 p.id,
//                 p.userId,
//                 p.heading,
//                 p.message,
//                 p.postimage,
//                 p.createdAt,
//                 COUNT(r.chatId) AS replyCount 
//             FROM 
//                 publicforumposts p 
//             LEFT JOIN 
//                 publicforumreplies r ON p.id = r.chatId 
//             GROUP BY 
//                 p.id 
//             ORDER BY 
//                 p.createdAt DESC
//             LIMIT ? OFFSET ?;
//         `;
//     db.plantcare.query(sql, [limit, offset], (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         const posts = results.map((post) => ({
//           ...post,
//           postimage: post.postimage ? post.postimage.toString("base64") : null,
//         }));
//         resolve(posts);
//       }
//     });
//   });
// };
exports.getPaginatedPosts = (limit, offset) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        p.id,
        p.userId,
        p.heading,
        p.message,
        p.postimage,
        p.createdAt,
        COUNT(r.chatId) AS replyCount,
        COALESCE(CONCAT(u.firstName, ' ', u.lastName), CONCAT(s.firstName, ' ', s.lastName)) AS userName
      FROM 
        publicforumposts p
      LEFT JOIN 
        publicforumreplies r ON p.id = r.chatId
      LEFT JOIN
        users u ON p.userId = u.id
      LEFT JOIN
        farmstaff s ON p.userId = s.id
      GROUP BY 
        p.id, u.firstName, u.lastName, s.firstName, s.lastName
      ORDER BY 
        p.createdAt DESC
      LIMIT ? OFFSET ?;
    `;
    db.plantcare.query(sql, [limit, offset], (err, results) => {
      if (err) {
        reject(err);
      } else {
        const posts = results.map((post) => ({
          ...post,
          postimage: post.postimage ? post.postimage.toString("base64") : null,
        }));
        resolve(posts);
      }
    });
  });
};



exports.getTotalPostsCount = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT COUNT(*) AS total FROM publicforumposts;`;
    db.plantcare.query(sql, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0].total);
      }
    });
  });
};

// exports.getRepliesByChatId = (chatId) => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//             SELECT 
//                 r.replyId, 
//                 r.replyMessage, 
//                 r.createdAt, 
//                 u.firstName AS userName 
//             FROM 
//                 publicforumreplies r
//             JOIN 
//                 publicforumposts p ON r.chatId = p.id
//             JOIN 
//                 users u ON r.replyId = u.id
//             WHERE 
//                 r.chatId = ?
//             ORDER BY 
//                 r.createdAt DESC
//         `;
//     db.plantcare.query(sql, [chatId], (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(results);
//         console.log(results);
//       }
//     });
//   });
// };
exports.getRepliesByChatId = (chatId) => {
  return new Promise((resolve, reject) => {
    const sql = `
            SELECT 
                r.replyId, 
                r.replyMessage, 
                r.createdAt, 
                IFNULL(u.firstName, 'Admin') AS userName  -- If replyId is null, use 'Admin' as the userName
            FROM 
                publicforumreplies r
            JOIN 
                publicforumposts p ON r.chatId = p.id
            LEFT JOIN  -- Use LEFT JOIN to handle cases where there's no matching user
                users u ON r.replyId = u.id
            WHERE 
                r.chatId = ?
            ORDER BY 
                r.createdAt DESC
        `;
    db.plantcare.query(sql, [chatId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
        console.log(results);
      }
    });
  });
};


exports.createReply = (chatId, replyId, replyMessage) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO publicforumreplies (chatId, replyId, replyMessage) VALUES (?, ?, ?)";
    db.plantcare.query(sql, [chatId, replyId, replyMessage], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.insertId); 
      }
    });
  });
};

exports.createPost = (userId, heading, message, postimage) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO publicforumposts (userId, heading, message, postimage) VALUES (?, ?, ?, ?)";
    db.plantcare.query(sql, [userId, heading, message, postimage], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.insertId); 
      }
    });
  });
};
