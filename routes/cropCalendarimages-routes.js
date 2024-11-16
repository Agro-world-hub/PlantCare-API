const express = require('express');
const { uploadImage, upload } = require('../end-point/cropCalendarimages-ep');

// Initialize the router
const router = express.Router();

// Define the route for uploading an image
router.post('/calendar-tasks/upload-image', upload.single('image'), uploadImage);

module.exports = router;