const express = require("express");
const auth = require("../services/authService.js");
const v = require("../utils/validators/addressValidator.js");
const s = require("../services/addressService.js");

//initialize router
const router = express.Router();
//middleware
router.use(express.json());

//routes
router.post(
  "/add",
  auth.authenticated,
  auth.allowedTo("user"),
  v.addAddressValidator,
  s.addAddress,
);

router.get(
  "/getAll",
  auth.authenticated,
  auth.allowedTo("user"),
  s.getMyAddresses,
);

router.delete(
  "/delete/:addressId",
  auth.authenticated,
  auth.allowedTo("user"),
  s.removeAddress,
);

module.exports = router;
