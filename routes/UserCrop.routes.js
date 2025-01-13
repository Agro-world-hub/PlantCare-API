const express = require('express');
const router = express.Router();
const authenticateToken = require('../Middlewares/auth.middleware');
const cropController = require('../Controllers/UserCrop.controller');

router.post('/crops-add', authenticateToken, cropController.createCrop);

router.get('/crops-view', authenticateToken, cropController.viewCrops);

router.delete('/crops-delete/:cropId', authenticateToken, cropController.deleteCrop);

module.exports = router;
