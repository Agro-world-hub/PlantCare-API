const express = require('express');
const router = express.Router();
const auth = require('../Middlewares/auth.middleware');
const complainEp = require("../end-point/complain-ep");

router.post('/add-complain', auth, complainEp.createComplain );
router.get('/get-complains', auth, complainEp.getComplains );
router.get('api/complain/reply/:id', complainEp.getComplainReplyByid );


module.exports = router;