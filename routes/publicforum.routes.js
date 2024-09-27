const express = require('express');
const router = express.Router();
const { createPost, getPosts, createReply, getReplies } = require('../Controllers/publicforum.controller');
const auth = require('../Middlewares/auth.middleware');
const upload = require('../Middlewares/multer.middleware');

router.post('/add/post', auth, upload.single('postimage'), createPost); // Create a new post
router.get('/get', getPosts); // Get all posts
router.post('/add/reply', auth, createReply); // Create a new reply
router.get('/get/:chatId', getReplies); // Get replies for a specific post

module.exports = router;