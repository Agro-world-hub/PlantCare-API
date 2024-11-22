const express = require('express');
const { uploadImage, upload, getRequiredImagesEndpoint } = require('../end-point/cropCalendarimages-ep');




// Initialize the router
const router = express.Router();

// Define the route for uploading an image
router.post('/calendar-tasks/upload-image', upload.single('image'), uploadImage);
router.get('/calendar-tasks/requiredimages/:cropId', getRequiredImagesEndpoint);

module.exports = router;