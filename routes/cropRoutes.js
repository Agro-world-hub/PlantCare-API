const express = require("express");
const auth = require("../Middlewares/auth.middleware");
const router = express.Router();
const userCrop = require("../end-point/userCrop-ep");

router.get("/get-all-crop/:categorie", userCrop.getCropByCategory);
router.get("/get-all-crop-bydistrict/:categorie/:district", userCrop.getCropByDistrict), 

router.get("/crop-feed/:cropid", auth, userCrop.CropCalanderFeed);

router.get("/get-crop-variety/:id", userCrop.getCropVariety);

router.get("/get-crop-calender-details/:id/:naofcul/:method", userCrop.getCropCalenderDetails);

router.post("/enroll-crop", auth, userCrop.enroll);

router.get("/get-user-ongoing-cul", auth, userCrop.OngoingCultivaionGetById);

router.get("/get-user-ongoingculscrops/:id", userCrop.getOngoingCultivationCropByid);

router.post("/update-ongoingcultivation", auth, userCrop.UpdateOngoingCultivationScrops);

router.get(
  "/slave-crop-calendar/:cropCalendarId",
  auth,
  userCrop.getSlaveCropCalendarDaysByUserAndCrop
);

router.get(
  "/slave-crop-calendar-progress/:cropCalendarId",
  auth,
  userCrop.getSlaveCropCalendarPrgress
);

router.post("/update-slave", auth, userCrop.updateCropCalendarStatus);

router.post("/geo-location", userCrop.addGeoLocation);

module.exports = router;
