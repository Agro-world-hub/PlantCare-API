// const jwt = require('jsonwebtoken');
// const asyncHandler = require("express-async-handler");
// const { createPostSchema } = require('../validations/createPost-validation'); // Import the validator
// const PostDAO = require('../dao/PostDAO'); // Import the Post DAO

// // Controller for creating a post
// exports.createPost = asyncHandler(async (req, res) => {
//     const userId = req.user.id; // Get the user ID from the request
//     const { chatHeadingId, chatId, heading, message } = req.body; // Destructure request body

//     // Validate incoming request data
//     await createPostSchema.validateAsync(req.body);

//     try {
//         // Call the DAO method to create a post
//         const postId = await PostDAO.createPost(userId, chatHeadingId, chatId, heading, message);
//         res.status(201).json({ message: 'Post created', postId }); // Send success response with post ID
//     } catch (err) {
//         console.error("Error creating post:", err);
//         res.status(500).json({ status: 'error', message: 'An error occurred while creating the post.' });
//     }
// });

// just started. has a issue with table