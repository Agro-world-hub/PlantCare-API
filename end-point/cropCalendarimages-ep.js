// Import necessary dependencies
const { insertTaskImage, getRequiredImages } = require('../dao/cropCalendarImages-dao'); // Import the DAO function
// Import the DAO function for required images
const logger = require('winston'); // Logger for logging actions
const multer = require('multer');

// Configure multer to store the image in memory
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Increase limit to 10 MB
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
        }
        cb(null, true);
    },
});

// Endpoint to handle image upload
const uploadImage = async(req, res) => {
    try {
        // Log the received FormData content and file details
        console.log('Received FormData:', req.body);
        console.log('Received file details:', req.file);

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const { slaveId } = req.body;
        if (!slaveId) {
            return res.status(400).json({ message: 'No slaveId provided.' });
        }

        // Get the image buffer
        const image = req.file.buffer;

        // Assuming insertTaskImage handles the database insert
        const result = await insertTaskImage(slaveId, image);

        console.log('Image uploaded successfully:', result); // Add log for success
        res.status(200).json({
            message: 'Image uploaded successfully.',
            imageDetails: {
                mimeType: req.file.mimetype,
                size: req.file.size,
            },
            result: result, // Send result of insertTaskImage function
        });
    } catch (error) {
        // Handle MulterError specifically for file size limit
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File size exceeds the maximum allowed size of 10 MB.',
            });
        }

        console.error('Error during image upload:', error); // Log detailed error
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Endpoint to get the required images for a cropId
const getRequiredImagesEndpoint = async(req, res) => {
    try {
        const { cropId } = req.params;

        console.log(cropId);

        if (!cropId) {
            return res.status(400).json({ message: 'No cropId provided.' });
        }

        // Fetch the number of required images for the given cropId
        const requiredImages = await getRequiredImages(cropId);

        if (requiredImages === null) {
            return res.status(404).json({ message: 'No data found for the provided cropId.' });
        }

        res.status(200).json({
            message: 'Required images fetched successfully.',
            requiredImages: requiredImages,
        });
    } catch (error) {
        console.error('Error fetching required images:', error); // Log detailed error
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}); 


// Export endpoint handler and multer middleware
module.exports = {
    uploadImage,
    upload,
    getRequiredImagesEndpoint,
};