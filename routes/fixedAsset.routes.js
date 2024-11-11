// // // const express = require('express');
// // // const { addFixedAsset, getFixedAssetsByCategoryAndUser, deleteFixedAsset } = require('../Controllers/fixedAsset.controller');
// // // const authMiddleware = require('../Middlewares/auth.middleware');

// // // const router = express.Router();
// // // const fixedAssetsEp = require("../end-point/fixedAsset-ep");

// // // // Add a new fixed asset
// // // router.post('/fixedassets', authMiddleware, addFixedAsset);
// // // //router.post('/fixedassets', authMiddleware, fixedAssetsEp.addFixedAsset);

// // // // // Get all fixed assets
// // // router.get('/fixedassets/category/:category', authMiddleware, getFixedAssetsByCategoryAndUser);

// // // // // Delete a fixed asset
// // //  router.delete('/fixedassets/:id', authMiddleware, deleteFixedAsset);


// // // //working
// // // //router.get('/fixedassets/category/:category', authMiddleware, fixedAssetsEp.getFixedAssetsByCategoryAndUser);

// // // //working
// // // //router.delete('/fixedassets/:id', authMiddleware, fixedAssetsEp.deleteFixedAsset);



// // // module.exports = router;

// // const express = require('express');
// // const { addFixedAsset, getFixedAssetsWithTotals, deleteFixedAsset, getFixedAssetDetailsById, getFixedAssetsByCategory, updateFixedAsset } = require('../Controllers/fixedAsset.controller');
// // const authMiddleware = require('../Middlewares/auth.middleware');

// // const router = express.Router();
// // const fixedAssetsEp = require("../end-point/fixedAsset-ep");

// // // Add a new fixed asset
// // router.post('/fixedassets', authMiddleware, addFixedAsset);
// // //router.post('/fixedassets', authMiddleware, fixedAssetsEp.addFixedAsset);

// // // // Get all fixed assets
// // // router.get('/fixedassets/category/:category', authMiddleware, getFixedAssetsWithTotals);

// // // // Delete a fixed asset
// // //router.delete('/fixedassets/:id', authMiddleware, deleteFixedAsset);

// // router.get('/fixed-assets/:category', authMiddleware, getFixedAssetsByCategory);

// // router.get('/fixedasset/:assetId/:category', authMiddleware, getFixedAssetDetailsById);

// // router.put('/fixedasset/:assetId/:category', authMiddleware, updateFixedAsset);

// // router.delete('/fixedasset/:assetId/:category', authMiddleware, deleteFixedAsset);


// // //working
// // // router.get('/fixed-assets/totals/:category', authMiddleware, fixedAssetsEp.getFixedAssetsByCategoryAndUser);




// // module.exports = router;



// // module.exports = router;

// const express = require('express');
// const { addFixedAsset, getFixedAssetsWithTotals, deleteFixedAsset, getFixedAssetDetailsById, getFixedAssetsByCategory, updateFixedAsset } = require('../Controllers/fixedAsset.controller');
// const authMiddleware = require('../Middlewares/auth.middleware');

// const router = express.Router();
// const fixedAssetsEp = require("../end-point/fixedAsset-ep");

// // Add a new fixed asset
// router.post('/fixedassets', authMiddleware, addFixedAsset);
// //router.post('/fixedassets', authMiddleware, fixedAssetsEp.addFixedAsset);

// // // Get all fixed assets
// // router.get('/fixedassets/category/:category', authMiddleware, getFixedAssetsWithTotals);

// // // Delete a fixed asset
// //router.delete('/fixedassets/:id', authMiddleware, deleteFixedAsset);

// router.get('/fixed-assets/:category', authMiddleware, getFixedAssetsByCategory);

// router.get('/fixedasset/:assetId/:category', authMiddleware, getFixedAssetDetailsById);

// router.put('/fixedasset/:assetId/:category', authMiddleware, updateFixedAsset);

// router.delete('/fixedasset/:assetId/:category', authMiddleware, deleteFixedAsset);

// module.exports = router;
// //working
// // router.get('/fixed-assets/totals/:category', authMiddleware, fixedAssetsEp.getFixedAssetsByCategoryAndUser);


const express = require('express');
const { addFixedAsset, getFixedAssetsWithTotals, deleteFixedAsset, getFixedAssetDetailsById, getFixedAssetsByCategory, updateFixedAsset } = require('../Controllers/fixedAsset.controller');
const authMiddleware = require('../Middlewares/auth.middleware');

const router = express.Router();
const fixedAssetsEp = require("../end-point/fixedAsset-ep");

// Add a new fixed asset
router.post('/fixedassets', authMiddleware, addFixedAsset);
//router.post('/fixedassets', authMiddleware, fixedAssetsEp.addFixedAsset);

// // Get all fixed assets
// router.get('/fixedassets/category/:category', authMiddleware, getFixedAssetsWithTotals);

// // Delete a fixed asset
//router.delete('/fixedassets/:id', authMiddleware, deleteFixedAsset);

router.get('/fixed-assets/:category', authMiddleware, getFixedAssetsByCategory);

router.get('/fixedasset/:assetId/:category', authMiddleware, getFixedAssetDetailsById);

router.put('/fixedasset/:assetId/:category', authMiddleware, updateFixedAsset);

router.delete('/fixedasset/:assetId/:category', authMiddleware, deleteFixedAsset);


//working
// router.get('/fixed-assets/totals/:category', authMiddleware, fixedAssetsEp.getFixedAssetsByCategoryAndUser);




module.exports = router;