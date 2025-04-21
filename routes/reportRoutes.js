// routes/transaction.js
const express = require('express');
const router = express.Router();
const transactionEp = require('../end-point/report-ep');
const authMiddleware = require('../Middlewares/auth.middleware');

/**
 * @route GET /api/transactions/history/:date
 * @desc Get transaction history by date
 * @access Private
 */
router.get('/history', authMiddleware, transactionEp.getTransactionHistory);
router.get('/report-user-details/:userId/:centerId/:companyId', transactionEp.getUserWithBankDetails);
router.get('/transaction-details/:userId/:createdAt/:farmerId', transactionEp.GetFarmerReportDetails);

module.exports = router;