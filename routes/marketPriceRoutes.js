const express = require("express");
const { getAllMarket } = require("../Controllers/marketPriceController");
const router = express.Router();
const marketPrice = require("../end-point/marketPrice-ep");
const auth = require("../Middlewares/auth.middleware");


//router.get("/get-all-market",getAllMarket)
router.get("/get-all-market",auth, marketPrice.getAllMarket);

module.exports = router;
