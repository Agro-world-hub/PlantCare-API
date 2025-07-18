const express = require('express');
const router = express.Router();
const auth = require('../Middlewares/auth.middleware');
const farmEp = require("../end-point/farm-ep");


router.post('/add-farm', auth, farmEp.CreateFarm);

router.get('/get-farms', auth, farmEp.getFarms);

router.get('/get-membership', auth, farmEp.getMemberShip);

router.get('/get-farms/byFarm-Id/:id', auth, farmEp.getFarmById);

router.post('/add-payment', auth, farmEp.CreatePayment);

router.get('/get-cropCount/:farmId', auth, farmEp.getCropCountByFarmId);


//cultivation
router.get("/get-user-ongoing-cul/:farmId", auth, farmEp.OngoingCultivaionGetById);

router.post("/enroll-crop/:farmId", auth, farmEp.enroll);


router.post("/members-phoneNumber-checker", farmEp.phoneNumberChecker);

router.put('/update-farm', auth, farmEp.UpdateFarm);


module.exports = router;
