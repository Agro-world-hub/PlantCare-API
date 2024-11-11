// const db = require('../startup/database'); // Import your database connection



// // Create a new post
// exports.createPost = (req, res) => {
//     const userId = req.user.id; // Assuming req.user contains authenticated user info
//     const { heading, message } = req.body;
//     console.log('Heading:', heading);
//     console.log('Message:', message);
//     console.log('File received:', req.file); // Log file received
//     let postimage = null;

//     // Check if an image was uploaded
//     if (req.file) {
//         postimage = req.file.buffer; // Store image in buffer as binary data
//     } else {
//         console.log('No image uploaded');
//     }

//     // Query to get the latest chatHeadingId and chatId
//     const getLastChatIdSql = 'SELECT chatHeadingId, chatId FROM publicforumposts ORDER BY chatHeadingId DESC, chatId DESC LIMIT 1';

//     db.query(getLastChatIdSql, (err, results) => {
//         if (err) {
//             console.error('Database query error:', err);
//             return res.status(500).json({ error: 'Failed to retrieve last chat IDs' });
//         }

//         let chatHeadingId = '001';
//         let chatId = '001';

//         if (results.length > 0) {
//             const lastChatHeadingId = parseInt(results[0].chatHeadingId);
//             const lastChatId = parseInt(results[0].chatId);

//             // Increment chatHeadingId and chatId
//             chatHeadingId = (lastChatHeadingId + 1).toString().padStart(3, '0');
//             chatId = (lastChatId + 1).toString().padStart(3, '0');
//         }

//         // Insert new post with auto-incremented chatHeadingId and chatId
//         const insertPostSql = 'INSERT INTO publicforumposts (userId, chatHeadingId, chatId, heading, message, postimage) VALUES (?, ?, ?, ?, ?, ?)';
//         db.query(insertPostSql, [userId, chatHeadingId, chatId, heading, message, postimage], (err, result) => {
//             if (err) {
//                 console.error('Error inserting post:', err);
//                 return res.status(500).json({ error: 'Failed to create post' });
//             }
//             res.status(201).json({ message: 'Post created', postId: result.insertId, chatHeadingId, chatId });
//         });
//     });
// };



// // Get all posts
// exports.getPosts = (req, res) => {
//     const sql = `
//         SELECT 
//             p.id,
//             p.userId,
//             p.chatHeadingId,
//             p.chatId,
//             p.heading,
//             p.message,
//             p.postimage,         -- Include the postimage field
//             p.createdAt,
//             COUNT(r.replyId) AS replyCount 
//         FROM 
//             publicforumposts p 
//         LEFT JOIN 
//             publicforumreplies r ON p.id = r.chatId 
//         GROUP BY 
//             p.id 
//         ORDER BY 
//             p.createdAt DESC
//     `;

//     db.query(sql, (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }

//         // Convert postimage from Buffer to Base64 string if it exists
//         const posts = results.map(post => ({
//             ...post,
//             postimage: post.postimage ? post.postimage.toString('base64') : null // Convert Buffer to Base64
//         }));

//         res.status(200).json(posts);
//     });
// };


// // Create a reply to a post
// exports.createReply = (req, res) => {
//     const { chatId, replyMessage } = req.body;
//     const replyId = req.user.id;

//     const sql = 'INSERT INTO publicforumreplies (chatId, replyId, replyMessage) VALUES (?, ?, ?)';
//     db.query(sql, [chatId, replyId, replyMessage], (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         res.status(201).json({ message: 'Reply created', replyId: result.insertId });
//     });
// };

// // Get replies for a post
// // Get replies for a post with user names
// exports.getReplies = (req, res) => {
//     const { chatId } = req.params;

//     const sql = `
//         SELECT 
//             r.replyId, 
//             r.replyMessage, 
//             r.createdAt, 
//             u.firstName AS userName 
//         FROM 
//             publicforumreplies r
//         JOIN 
//             publicforumposts p ON r.chatId = p.chatId  -- Linking replies to the posts
//         JOIN 
//             users u ON p.userId = u.id  -- Joining with the users table to get user names
//         WHERE 
//             r.chatId = ? 
//         ORDER BY 
//             r.createdAt DESC
//     `;

//     db.query(sql, [chatId], (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         res.status(200).json(results);
//     });
// };


const db = require('../startup/database'); // Import your database connection



// Create a new post
// exports.createPost = (req, res) => {
//     const userId = req.user.id; // Assuming req.user contains authenticated user info
//     const { heading, message } = req.body;
//     console.log('Heading:', heading);
//     console.log('Message:', message);
//     console.log('File received:', req.file); // Log file received

//     let postimage = null;

//     // Check if an image was uploaded
//     if (req.file) {
//         postimage = req.file.buffer; // Store image in buffer as binary data
//     } else {
//         console.log('No image uploaded');
//     }

//     // Insert new post without chatHeadingId and chatId
//     const insertPostSql = 'INSERT INTO publicforumposts (userId, heading, message, postimage) VALUES (?, ?, ?, ?)';
//     db.query(insertPostSql, [userId, heading, message, postimage], (err, result) => {
//         if (err) {
//             console.error('Error inserting post:', err);
//             return res.status(500).json({ error: 'Failed to create post' });
//         }
//         res.status(201).json({ message: 'Post created', postId: result.insertId });
//     });
// };




// // Get all posts
// exports.getPosts = (req, res) => {
//     const sql = `
//         SELECT 
//             p.id,
//             p.userId,
//             p.heading,
//             p.message,
//             p.postimage,         -- Include the postimage field
//             p.createdAt,
//             COUNT(r.replyId) AS replyCount 
//         FROM 
//             publicforumposts p 
//         LEFT JOIN 
//             publicforumreplies r ON p.id = r.chatId 
//         GROUP BY 
//             p.id, p.userId, p.heading, p.message, p.postimage, p.createdAt  -- Include all selected columns
//         ORDER BY 
//             p.createdAt DESC
//     `;

//     db.query(sql, (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }

//         // Convert postimage from Buffer to Base64 string if it exists
//         const posts = results.map(post => ({
//             ...post,
//             postimage: post.postimage ? post.postimage.toString('base64') : null // Convert Buffer to Base64
//         }));

//         res.status(200).json(posts);
//     });
// };


// // Create a reply to a post(chat id = post id)
// exports.createReply = (req, res) => {
//     const { chatId, replyMessage } = req.body;
//     const replyId = req.user.id;

//     const sql = 'INSERT INTO publicforumreplies (chatId, replyId, replyMessage) VALUES (?, ?, ?)';
//     db.query(sql, [chatId, replyId, replyMessage], (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         res.status(201).json({ message: 'Reply created', replyId: result.insertId });
//     });
// };

// // Get replies for a post
// // Get replies for a post with user names
// exports.getReplies = (req, res) => {
//     const { chatId } = req.params;

//     const sql = `
//         SELECT 
//             r.replyId, 
//             r.replyMessage, 
//             r.createdAt, 
//             u.firstName AS userName 
//         FROM 
//             publicforumreplies r
//         JOIN 
//             publicforumposts p ON r.chatId = p.id  -- Linking replies to the posts
//         JOIN 
//             users u ON p.userId = u.id  -- Joining with the users table to get user names
//         WHERE 
//             r.chatId = ? 
//         ORDER BY 
//             r.createdAt DESC
//     `;

//     db.query(sql, [chatId], (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         res.status(200).json(results);
//     });
// };






// Create a new post
exports.createPost = (req, res) => {
    const userId = req.user.id; // Assuming req.user contains authenticated user info
    const { heading, message } = req.body;
    console.log('Heading:', heading);
    console.log('Message:', message);
    console.log('File received:', req.file); // Log file received

    let postimage = null;

    // Check if an image was uploaded
    if (req.file) {
        postimage = req.file.buffer; // Store image in buffer as binary data
    } else {
        console.log('No image uploaded');
    }

    // Insert new post without chatHeadingId and chatId
    const insertPostSql = 'INSERT INTO publicforumposts (userId, heading, message, postimage) VALUES (?, ?, ?, ?)';
    db.query(insertPostSql, [userId, heading, message, postimage], (err, result) => {
        if (err) {
            console.error('Error inserting post:', err);
            return res.status(500).json({ error: 'Failed to create post' });
        }
        res.status(201).json({ message: 'Post created', postId: result.insertId });
    });
};




// Get all posts
exports.getPosts = (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get the page number from the query, default to 1
    const limit = parseInt(req.query.limit) || 10; // Get the limit from the query, default to 10
    const offset = (page - 1) * limit; // Calculate the offset

    // SQL query to fetch posts with pagination
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
        LIMIT ? OFFSET ?;  -- Add LIMIT and OFFSET to the query
    `;

    // Execute the query with limit and offset parameters
    db.query(sql, [limit, offset], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Convert postimage from Buffer to Base64 string if it exists
        const posts = results.map(post => ({
            ...post,
            postimage: post.postimage ? post.postimage.toString('base64') : null // Convert Buffer to Base64
        }));

        // Query to get the total count of posts
        const countSql = `SELECT COUNT(*) AS total FROM publicforumposts;`;

        db.query(countSql, (err, countResult) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const totalPosts = countResult[0].total; // Get the total number of posts
            res.status(200).json({
                total: totalPosts, // Return the total number of posts
                posts, // Return the paginated posts
            });
        });
    });
};


// Create a reply to a post(chat id = post id)
exports.createReply = (req, res) => {
    const { chatId, replyMessage } = req.body;
    const replyId = req.user.id;

    const sql = 'INSERT INTO publicforumreplies (chatId, replyId, replyMessage) VALUES (?, ?, ?)';
    db.query(sql, [chatId, replyId, replyMessage], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Reply created', replyId: result.insertId });
    });
};

// Get replies for a post
// Get replies for a post with user names
exports.getReplies = (req, res) => {
    const { chatId } = req.params;

    const sql = `
        SELECT 
            r.replyId, 
            r.replyMessage, 
            r.createdAt, 
            u.firstName AS userName 
        FROM 
            publicforumreplies r
        JOIN 
            publicforumposts p ON r.chatId = p.id  -- Linking replies to the posts
        JOIN 
            users u ON p.userId = u.id  -- Joining with the users table to get user names
        WHERE 
            r.chatId = ? 
        ORDER BY 
            r.createdAt DESC
    `;

    db.query(sql, [chatId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
};