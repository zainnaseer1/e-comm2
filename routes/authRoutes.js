const express = require("express");
const {
  signUpValidator,
  logInValidator,
} = require("../utils/validators/authValidator.js");
const {
  signUp,
  login,
  forgotPassword,
  verifyPasswordResetCode,
  resetPass,
} = require("../services/authService.js");

//initialize router
const router = express.Router();
//middleware
router.use(express.json());

//routes
router.route("/signup").post(signUpValidator, signUp);
router.route("/login").post(logInValidator, login);
router.route("/forgotPassword").post(forgotPassword);
router.route("/forgotPassword/verifyResetCode").post(verifyPasswordResetCode);
router.route("/forgotPassword/verifyResetCode/resetPassword").put(resetPass);

module.exports = router;
