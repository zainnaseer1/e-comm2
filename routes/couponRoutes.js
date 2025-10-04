const express = require("express");

const auth = require("../services/authService.js");
const s = require("../services/couponService.js");
// const v = require("../utils/validators/couponValidator.js");

// Initialize router
const router = express.Router();
//middleware
router.use(express.json());
router.use(auth.authenticated, auth.allowedTo("admin", "manager"));

// Routes
router.post("/add", s.createCoupon);

router.get("/", s.getCoupons);
router.get("/getOne/:id", s.getCouponById);

router.put("/update/:id", s.updateCoupon);
router.delete("/delete/:id", s.deleteCoupon);

module.exports = router;
