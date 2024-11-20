const express = require('express');
const { uploadImage } = require('../end-point/cropCalendarimages-ep');
const upload = require('../Middlewares/multer.middleware');


// Initialize the router
const router = express.Router();

// Define the route for uploading an image
router.post('/calendar-tasks/upload-image', upload.single('image'), uploadImage);

module.exports = router;