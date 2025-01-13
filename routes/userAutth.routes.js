const express = require("express");
const auth = require("../Middlewares/auth.middleware");
const userAuthEp = require("../end-point/userAuth-ep");
const router = express.Router();
const upload = require('../Middlewares/multer.middleware');

router.post("/user-register", userAuthEp.SignupUser);

router.post("/user-login", userAuthEp.loginUser);

router.get("/user-profile", auth, userAuthEp.getProfileDetails);

router.put("/user-updatePhone", auth, userAuthEp.updatePhoneNumber);

router.post("/user-register-checker", userAuthEp.signupChecker);

router.put("/user-update-names", auth, userAuthEp.updateFirstLastName);

router.post('/registerBankDetails', auth, userAuthEp.registerBankDetails);

router.put("/user-update-names", auth, userAuthEp.updateFirstLastName);

router.post('/registerBankDetails', auth, userAuthEp.registerBankDetails);

router.post('/upload-profile-image', auth, upload.single('profileImage'), userAuthEp.uploadProfileImage);

module.exports = router;