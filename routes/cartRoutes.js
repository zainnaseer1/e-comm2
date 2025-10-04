const express = require("express");
const auth = require("../services/authService.js");
// const v = require("../utils/validators/cartValidator.js");
const s = require("../services/cartService.js");

//initialize router
const router = express.Router();
//middleware
router.use(express.json());
router.use(auth.authenticated, auth.allowedTo("user"));
//routes
router.post("/add", s.addProductToCart);

router.get("/getAll", s.getCart);

router.put("/update/:itemId", s.updateItemQuantity);
router.put("/applyCoupon", s.applyCoupon);
router.put("/dismountCoupon", s.dismountCoupon);

router.delete("/delete/:itemId", s.deleteItem);
router.delete("/clear", s.clearCart);

module.exports = router;
