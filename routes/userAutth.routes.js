const express = require("express");
const {
  loginController,
  getProfileDetails,
  updatePhoneNumber,
  SignUp,
} = require("../Controllers/userAuth.controller");
const auth = require("../Middlewares/auth.middleware");
const userAuthEp = require("../end-point/userAuth-ep");
const router = express.Router();

router.post("/user-register", userAuthEp.SignupUser);

//router.post('/user-login', loginController);
router.post("/user-login", userAuthEp.loginUser);

router.get("/user-profile", auth, userAuthEp.getProfileDetails);

router.put("/user-updatePhone", auth, userAuthEp.updatePhoneNumber);

module.exports = router;
