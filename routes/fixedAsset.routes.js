const express = require('express');
const { addFixedAsset, getFixedAssetsByCategoryAndUser, deleteFixedAsset } = require('../Controllers/fixedAsset.controller');
const authMiddleware = require('../Middlewares/auth.middleware');

const router = express.Router();
const fixedAssetsEp = require("../end-point/fixedAsset-ep");

// Add a new fixed asset
router.post('/fixedassets', authMiddleware, addFixedAsset);
//router.post('/fixedassets', authMiddleware, fixedAssetsEp.addFixedAsset);

// // Get all fixed assets
// router.get('/fixedassets/category/:category', authMiddleware, getFixedAssetsByCategoryAndUser);

// // Delete a fixed asset
 //router.delete('/fixedassets/:id', authMiddleware, deleteFixedAsset);


//working
router.get('/fixedassets/category/:category', authMiddleware, fixedAssetsEp.getFixedAssetsByCategoryAndUser);

//working
router.delete('/fixedassets/:id', authMiddleware, fixedAssetsEp.deleteFixedAsset);



module.exports = router;