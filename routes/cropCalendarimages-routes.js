const express = require('express');
<<<<<<< HEAD
const { uploadImage ,upload} = require('../end-point/cropCalendarimages-ep');
=======
const { uploadImage } = require('../end-point/cropCalendarimages-ep');
const upload = require('../Middlewares/multer.middleware');
>>>>>>> 3c06686a269f06e1fa939301de613d468b834f74


// Initialize the router
const router = express.Router();

// Define the route for uploading an image
router.post('/calendar-tasks/upload-image', upload.single('image'), uploadImage);

module.exports = router;