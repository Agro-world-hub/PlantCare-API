// const express = require("express");
// const router = express.Router();
// const currentAssetController = require("../Controllers/currentAssets.controller");
// const authMiddleware = require("../Middlewares/auth.middleware");
// const currentAssetsEp = require("../end-point/currentAsset-ep");

// // Get a current asset by category
// // router.get('/assets', authMiddleware, currentAssetController.getAssetsByCategory);

// // // Get all current assets for a logged-in user
// // router.get('/currentAsset', authMiddleware, currentAssetController.getAllCurrentAssets);

// // // Add a new current asset
// router.post('/currentAsset', authMiddleware, currentAssetController.handleAddFixedAsset);

// // // Delete a current asset
// // router.delete('/removeAsset/:category/:assetId', authMiddleware, currentAssetController.deleteAsset);

// //working
// router.get("/assets", authMiddleware, currentAssetsEp.getAssetsByCategory);

// //working
// router.get(
//   "/currentAsset",
//   authMiddleware,
//   currentAssetsEp.getAllCurrentAssets
// );

// //not sureeeeee.but checked
// router.delete('/removeAsset/:category/:assetId', authMiddleware, currentAssetsEp.deleteAsset);

// module.exports = router;

const express = require("express");
const router = express.Router();
const currentAssetController = require("../Controllers/currentAssets.controller");
const authMiddleware = require("../Middlewares/auth.middleware");
const currentAssetsEp = require("../end-point/currentAsset-ep");

// Get a current asset by category
// router.get('/assets', authMiddleware, currentAssetController.getAssetsByCategory);

// // Get all current assets for a logged-in user
// router.get('/currentAsset', authMiddleware, currentAssetController.getAllCurrentAssets);

// // Add a new current asset
//router.post('/currentAsset', authMiddleware, currentAssetController.handleAddFixedAsset);
router.post('/currentAsset', authMiddleware, currentAssetsEp.handleAddFixedAsset);

// // Delete a current asset
// router.delete('/removeAsset/:category/:assetId', authMiddleware, currentAssetController.deleteAsset);

//working
router.get("/assets", authMiddleware, currentAssetsEp.getAssetsByCategory);

//working
router.get(
  "/currentAsset",
  authMiddleware,
  currentAssetsEp.getAllCurrentAssets
);

//not sureeeeee.but checked
router.delete('/removeAsset/:category/:assetId', authMiddleware, currentAssetsEp.deleteAsset);

module.exports = router;
