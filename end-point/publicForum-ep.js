const asyncHandler = require("express-async-handler");

const {
  getPostsSchema,
  getRepliesSchema,
  createReplySchema,
  createPostSchema,
} = require("../validations/publicForum-validation");
const postsDao = require("../dao/publicForum-dao");

exports.getPosts = asyncHandler(async (req, res) => {
  try {
    // Validate query parameters
    const { page, limit } = await getPostsSchema.validateAsync(req.query);
    const offset = (page - 1) * limit;

    // Fetch posts using DAO
    const posts = await postsDao.getPaginatedPosts(limit, offset);

    // Fetch the total number of posts using DAO
    const totalPosts = await postsDao.getTotalPostsCount();

    // Send the response
    res.status(200).json({
      total: totalPosts,
      posts,
    });
  } catch (err) {
    console.error("Error fetching posts:", err);

    if (err.isJoi) {
      return res.status(400).json({
        status: "error",
        message: err.details[0].message,
      });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.getReplies = asyncHandler(async (req, res) => {
  try {
    // Validate the request parameter
    const { chatId } = await getRepliesSchema.validateAsync(req.params);

    // Fetch replies using DAO
    const replies = await postsDao.getRepliesByChatId(chatId);

    // Send the response
    res.status(200).json(replies);
  } catch (err) {
    console.error("Error fetching replies:", err);

    if (err.isJoi) {
      return res.status(400).json({
        status: "error",
        message: err.details[0].message,
      });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.createReply = asyncHandler(async (req, res) => {
  try {
    // Validate the request body
    const { chatId, replyMessage } = await createReplySchema.validateAsync(
      req.body
    );
    const replyId = req.user.id;

    // Create reply using DAO
    const newReplyId = await postsDao.createReply(
      chatId,
      replyId,
      replyMessage
    );

    // Send the response
    res.status(201).json({ message: "Reply created", replyId: newReplyId });
  } catch (err) {
    console.error("Error creating reply:", err);

    if (err.isJoi) {
      return res.status(400).json({
        status: "error",
        message: err.details[0].message,
      });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.createPost = asyncHandler(async (req, res) => {
  try {
    // Validate the request body
    const { heading, message } = await createPostSchema.validateAsync(req.body);
    const userId = req.user.id;

    console.log("Heading:", heading);
    console.log("Message:", message);
    console.log("File received:", req.file); // Log file received

    let postimage = null;

    // Check if an image was uploaded
    if (req.file) {
      postimage = req.file.buffer; // Store image in buffer as binary data
    } else {
      console.log("No image uploaded");
    }

    // Create post using DAO
    const newPostId = await postsDao.createPost(
      userId,
      heading,
      message,
      postimage
    );

    // Send the response
    res.status(201).json({ message: "Post created", postId: newPostId });
  } catch (err) {
    console.error("Error creating post:", err);

    if (err.isJoi) {
      return res.status(400).json({
        status: "error",
        message: err.details[0].message,
      });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});
