const db = require("../startup/database");

// DAO method to fetch all posts

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
                COUNT(r.replyId) AS replyCount 
            FROM 
                publicforumposts p 
            LEFT JOIN 
                publicforumreplies r ON p.id = r.chatId 
            GROUP BY 
                p.id 
            ORDER BY 
                p.createdAt DESC
            LIMIT ? OFFSET ?;
        `;
    db.query(sql, [limit, offset], (err, results) => {
      if (err) {
        reject(err);
      } else {
        // Convert postimage from Buffer to Base64 string if it exists
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
    db.query(sql, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0].total);
      }
    });
  });
};

exports.getRepliesByChatId = (chatId) => {
  return new Promise((resolve, reject) => {
    const sql = `
            SELECT 
                r.replyId, 
                r.replyMessage, 
                r.createdAt, 
                u.firstName AS userName 
            FROM 
                publicforumreplies r
            JOIN 
                publicforumposts p ON r.chatId = p.id
            JOIN 
                users u ON p.userId = u.id
            WHERE 
                r.chatId = ?
            ORDER BY 
                r.createdAt DESC
        `;
    db.query(sql, [chatId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.createReply = (chatId, replyId, replyMessage) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO publicforumreplies (chatId, replyId, replyMessage) VALUES (?, ?, ?)";
    db.query(sql, [chatId, replyId, replyMessage], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.insertId); // Return the inserted reply's ID
      }
    });
  });
};

exports.createPost = (userId, heading, message, postimage) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO publicforumposts (userId, heading, message, postimage) VALUES (?, ?, ?, ?)";
    db.query(sql, [userId, heading, message, postimage], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.insertId); // Return the inserted post's ID
      }
    });
  });
};
