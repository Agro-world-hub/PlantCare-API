const express = require("express");
const {
  getCropByCatogory,
  CropCalanderFeed,
  getCropById,
  enroll,
  OngoingCultivaionGetById,
} = require("../Controllers/cropController");
const auth = require("../Middlewares/auth.middleware");
const router = express.Router();
const userCrop = require("../end-point/userCrop-ep");

// router.get("/get-all-crop/:categorie", getCropByCatogory)
// router.get("/crop-feed/:cropid",auth, CropCalanderFeed)
// router.get("/get-crop/:id", getCropById)
// router.get("/enroll-crop/:cropId",auth,enroll)
// router.get("/get-user-ongoing-cul",auth,OngoingCultivaionGetById)

//working
router.get("/get-all-crop/:categorie", userCrop.getCropByCategory);

//working
router.get("/crop-feed/:cropid", auth, userCrop.CropCalanderFeed);

//working
router.get("/get-crop/:id", userCrop.getCropById);

// router.get("/enroll-crop/:cropId", auth, enroll);
router.get("/enroll-crop/:cropId", auth, userCrop.enroll);

//working
router.get("/get-user-ongoing-cul", auth, userCrop.OngoingCultivaionGetById);

module.exports = router;
