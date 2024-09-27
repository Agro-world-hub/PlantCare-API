const express = require('express');
const router = express.Router();
const authenticateToken = require('../Middlewares/auth.middleware');
const cropController = require('../Controllers/UserCrop.controller');

// Create a new crop
router.post('/crops-add', authenticateToken, cropController.createCrop);

// View crops for the logged-in user
router.get('/crops-view', authenticateToken, cropController.viewCrops);

// Delete a crop
router.delete('/crops-delete/:cropId', authenticateToken, cropController.deleteCrop);

module.exports = router;
