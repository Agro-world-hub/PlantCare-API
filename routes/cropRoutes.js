const express = require("express");
const auth = require("../Middlewares/auth.middleware");
const router = express.Router();
const userCrop = require("../end-point/userCrop-ep");

// router.get("/get-all-crop/:categorie", getCropByCatogory)
// router.get("/crop-feed/:cropid",auth, CropCalanderFeed)
// router.get("/get-crop/:id", getCropById)
// router.get("/enroll-crop/:cropId",auth,enroll)
// router.get("/get-user-ongoing-cul",auth,OngoingCultivaionGetById)
// router.get("/slave-crop-calendar/:cropCalendarId", auth, getSlaveCropCalendarDaysByUserAndCrop);
//router.post("/update-slave",auth,updateCropCalendarStatus)

//working
router.get("/get-all-crop/:categorie", userCrop.getCropByCategory);

//working
router.get("/crop-feed/:cropid", auth, userCrop.CropCalanderFeed);

//working
router.get("/get-crop-variety/:id", userCrop.getCropVariety);

router.get("/get-crop-calender-details/:id/:naofcul/:method", userCrop.getCropCalenderDetails);

//router.get("/enroll-crop/:cropId", auth, enroll);
router.get("/enroll-crop/:cropId/:extent/:startDate", auth, userCrop.enroll);

//working
router.get("/get-user-ongoing-cul", auth, userCrop.OngoingCultivaionGetById);

router.get("/get-user-ongoingculscrops/:id", userCrop.getOngoingCultivationCropByid);

router.post("/update-ongoingcultivation", auth, userCrop.UpdateOngoingCultivationScrops);
// router.post("/enrollslave", auth, insertTasksToSlaveCropCalendarDays);

//get data from slave crop cal not working.........
// router.get("/slave-crop-calendar/:cropCalendarId", auth, getSlaveCropCalendarDaysByUserAndCrop);
router.get(
  "/slave-crop-calendar/:cropCalendarId",
  auth,
  userCrop.getSlaveCropCalendarDaysByUserAndCrop
);

// router.post("/update-slave-crop-status",auth,updateSlaveCropStatusById)
// router.post("/update-slave",auth,updateCropCalendarStatus)
router.post("/update-slave", auth, userCrop.updateCropCalendarStatus);

module.exports = router;
