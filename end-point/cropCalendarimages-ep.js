const multer = require('multer');
const { insertTaskImage } = require('../dao/cropCalendarimages-dao');
const logger = require('winston');
const asyncHandler = require("express-async-handler");


// Setup multer to handle file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
        }
        cb(null, true);
    },
});

/**
 * Handles the upload and insertion of task images
 */
const uploadImage =asyncHandler(async(req, res) => {
    try {
        console.log("route hitttttttttttt");
        // Log the FormData content
        console.log("Received FormData:", req.body); // Log the other fields sent in the FormData
        console.log("Received file details:", req.file); // Log the file details (name, mimeType, size)

        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded.' });
        }

        const { slaveId } = req.body;

        if (!slaveId || typeof slaveId !== 'string') {
            return res.status(400).json({ message: 'Invalid slaveId provided.' });
        }

        const image = req.file.buffer; // Buffer of the uploaded file

        // Call the DAO method to insert the image
        const result = await insertTaskImage(slaveId, image);

        logger.info(`Image uploaded successfully for slaveId: ${slaveId}`);
        res.status(200).json({
            message: 'Image uploaded successfully.',
            imageDetails: {
                mimeType: req.file.mimetype,
                size: req.file.size,
            },
            result: result,
        });
    } catch (error) {
        logger.error('Error uploading image:', error);
        res.status(500).json({ message: error.message });
    }
}); 

// Export endpoint handler
module.exports = {
    uploadImage,
    upload,
};