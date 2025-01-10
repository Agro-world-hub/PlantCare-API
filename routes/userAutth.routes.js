const express = require("express");
const {
    loginController,
    getProfileDetails,
    updatePhoneNumber,
    SignUp,
    signupChecker,
    updateFirstLastName
} = require("../Controllers/userAuth.controller");
const auth = require("../Middlewares/auth.middleware");
const userAuthEp = require("../end-point/userAuth-ep");
const router = express.Router();
const upload = require('../Middlewares/multer.middleware');

router.post("/user-register", userAuthEp.SignupUser);

//router.post('/user-login', loginController);
router.post("/user-login", userAuthEp.loginUser);

router.get("/user-profile", auth, userAuthEp.getProfileDetails);

router.put("/user-updatePhone", auth, userAuthEp.updatePhoneNumber);

// router.post("/user-register-checker", signupChecker );
router.post("/user-register-checker", userAuthEp.signupChecker);

// router.put("/user-update-names", auth, updateFirstLastName );
router.put("/user-update-names", auth, userAuthEp.updateFirstLastName);

// Endpoint to register bank details
router.post('/registerBankDetails', auth, userAuthEp.registerBankDetails);



router.put("/user-update-names", auth, userAuthEp.updateFirstLastName);

router.post('/registerBankDetails', auth, userAuthEp.registerBankDetails);

router.post('/update-useraddress', auth, userAuthEp.updateAddress);

// Define the endpoint to check address fields

router.get('/check-address-fields', auth, userAuthEp.checkAddressFields);
// router.get('/validate-token', auth, userAuthEp.validateToken);
router.post('/upload-profile-image', auth, upload.single('profileImage'), userAuthEp.uploadProfileImage);

module.exports = router;