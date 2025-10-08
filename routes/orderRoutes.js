const express = require("express");
const auth = require("../services/authService.js");
const v = require("../utils/validators/orderValidator.js");
const s = require("../services/orderService.js");

//initialize router
const router = express.Router();

//middleware
router.use(express.json());
router.use(auth.authenticated);

//routes
router.post(
  "/addOne",
  auth.allowedTo("user"),
  v.cashOrderValidator,
  s.createCashOrder,
);

router.get(
  "/checkout-session",
  auth.allowedTo("user"),
  s.checkoutSession,
  s.webhookCheckout,
);

router.get(
  "/",
  auth.allowedTo("user", "admin", "manager"),
  s.ordersFilter,
  s.getAllOrders,
);
router.get(
  "/getOne/:orderId",
  auth.allowedTo("user", "admin", "manager"),
  s.ordersFilter,
  s.getOne,
);

router.put(
  "/toPaid/:orderId",
  auth.allowedTo("admin", "manager"),
  s.isPaidToTrue,
);
router.put(
  "/toDelivered/:orderId",
  auth.allowedTo("admin", "manager"),
  s.isDeliveredToTrue,
);

// router.delete("/delete/:id", s.removeFromWishlist);

module.exports = router;
