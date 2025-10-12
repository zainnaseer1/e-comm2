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

//add new cash order
router.post(
  "/addOne",
  auth.allowedTo("user"),
  v.cashOrderValidator,
  s.createCashOrder,
);

//send checkout session to user to handle payment
router.get("/checkout-session", auth.allowedTo("user"), s.checkoutSession);

//get all orders you are allowed to view
router.get(
  "/",
  auth.allowedTo("user", "admin", "manager"),
  s.ordersFilter,
  s.getAllOrders,
);
// get specific order by id
router.get(
  "/getOne/:orderId",
  auth.allowedTo("user", "admin", "manager"),
  s.ordersFilter,
  s.getOne,
);
//change order payment status to paid
router.put(
  "/toPaid/:orderId",
  auth.allowedTo("admin", "manager"),
  s.isPaidToTrue,
);
//change order delivery status to delivered
router.put(
  "/toDelivered/:orderId",
  auth.allowedTo("admin", "manager"),
  s.isDeliveredToTrue,
);

module.exports = router;
