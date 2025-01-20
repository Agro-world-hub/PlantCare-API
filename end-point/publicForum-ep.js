const asyncHandler = require("express-async-handler");

const {
  getPostsSchema,
  getRepliesSchema,
  createReplySchema,
  createPostSchema,
} = require("../validations/publicForum-validation");
const postsDao = require("../dao/publicForum-dao");
const uploadFileToS3  = require('../Middlewares/s3upload')

exports.getPosts = asyncHandler(async (req, res) => {
  try {
    const { page, limit } = await getPostsSchema.validateAsync(req.query);
    const offset = (page - 1) * limit;

    const posts = await postsDao.getPaginatedPosts(limit, offset);

    const totalPosts = await postsDao.getTotalPostsCount();

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
    const { chatId } = await getRepliesSchema.validateAsync(req.params);

    const replies = await postsDao.getRepliesByChatId(chatId);

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
    const { chatId, replyMessage } = await createReplySchema.validateAsync(
      req.body
    );
    const replyId = req.user.id;

    const newReplyId = await postsDao.createReply(
      chatId,
      replyId,
      replyMessage
    );

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
    const { heading, message } = await createPostSchema.validateAsync(req.body);
    const userId = req.user.id;

    let postimage = null;

    if (req.file) {
      const fileName = req.file.originalname;
      const imageBuffer = req.file.buffer
        const image = await uploadFileToS3(imageBuffer, fileName, "taskimages/image");
      postimage = image; 
    } else {
    }

    const newPostId = await postsDao.createPost(
      userId,
      heading,
      message,
      postimage
    );

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
