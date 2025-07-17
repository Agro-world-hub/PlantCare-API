const express = require('express');
const router = express.Router();
const auth = require('../Middlewares/auth.middleware');
const upload = require('../Middlewares/multer.middleware');
const postsEp = require("../end-point/publicForum-ep");


router.get('/get', postsEp.getPosts); 
router.get('/get/:chatId', postsEp.getReplies); 
router.post('/add/reply', auth, postsEp.createReply);
router.post('/add/post', auth, upload.single('postimage'), postsEp.createPost);
router.delete('/delete/:postId', auth, postsEp.deletePost);

module.exports = router;