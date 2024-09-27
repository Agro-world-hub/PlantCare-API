const express = require("express");
const { getAllMarket } = require("../Controllers/marketPriceController");
const router = express.Router();
const marketPrice = require("../end-point/marketPrice-ep");

//router.get("/get-all-market",getAllMarket)
router.get("/get-all-market", marketPrice.getAllMarket);

module.exports = router;
