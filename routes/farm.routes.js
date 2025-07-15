const express = require('express');
const router = express.Router();
const auth = require('../Middlewares/auth.middleware');
const farmEp = require("../end-point/farm-ep");


router.post('/add-farm', auth, farmEp.CreateFarm);

router.get('/get-farms', auth, farmEp.getFarms);
router.get('/get-farms/byFarm-Id/:id', auth, farmEp.getFarmById);

router.post('/add-payment', auth, farmEp.CreatePayment);

module.exports = router;
