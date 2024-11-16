const multer = require('multer');
const { insertTaskImage } = require('../dao/cropCalendarimages-dao');

// Setup multer to handle file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Handles the upload and insertion of task images
 */
const uploadImage = async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded.' });
        }

        const { slaveId } = req.body; // Get slaveId from request body
        const image = req.file.buffer;
        // Get the image data as Buffe

        // Call the DAO method to insert the image
        const result = await insertTaskImage(slaveId, image);

        res.status(200).json({
            message: 'Image uploaded successfully.',
            result: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export endpoint handler
module.exports = {
    uploadImage,
    upload // This is the multer instance to be used in the routes
};