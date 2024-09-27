const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Store files in memory (Buffer)

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            return cb(new Error('Only images are allowed')); // Ensure to return error
        }
    }
});

// Middleware to handle Multer errors
const errorsHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('File is too large. Maximum allowed size is 5MB.');
        }
    } else if (err) {
        return res.status(400).send(err.message); // Handle other validation errors
    }
    next(); // Proceed to the next middleware if no error
};

module.exports = upload; // Export both upload and error handler]