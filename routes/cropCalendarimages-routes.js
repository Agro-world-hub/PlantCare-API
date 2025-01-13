const express = require('express');
const { uploadImage, upload, getRequiredImagesEndpoint } = require('../end-point/cropCalendarimages-ep');

const router = express.Router();

router.post('/calendar-tasks/upload-image', upload.single('image'), uploadImage);
router.get('/calendar-tasks/requiredimages/:cropId', getRequiredImagesEndpoint);

module.exports = router;