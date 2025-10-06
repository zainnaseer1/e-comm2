const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const ApiError = require("../utils/apiError");
const factory = require("../services/handlersFactory");

const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

//@DESC create new order
//@ROUTE POST /api/v1/order/addOne
//@ACCESS auth user
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  //1) get cart based on user
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart)
    return next(new ApiError(`No cart with this user: ${req.user._id}`, 404));

  //2) get price from cart, check if there is a coupon or not
  // check if there is cart.totalPriceAfterDiscount,
  // assign its value to cartPrice, else keep regular total price
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const taxCost = 0; // app setting added by admin
  const shippingCost = 0;

  const totalOrderPrice = cartPrice + taxCost + shippingCost;

  let addrIndex = null;
  if (req.body.addressAlias) {
    addrIndex = user.addresses.findIndex(
      (address) => (address.alias = req.body.addressAlias),
    );
  }

  let dropOffAddress =
    req.user.addresses[addrIndex] ||
    req.user.addresses[0] ||
    req.body.addressId;

  //3) create order with required settings, make sure payment method is cash
  const order = await Order.create({
    user: req.user._id,
    shippingAddress: dropOffAddress,
    phone: req.user.phone || req.body.phone,
    cartItems: cart.cartItems,
    totalOrderPrice: totalOrderPrice,
    // issueDate: Date.now(), // mongoose auto generate createdAt
  });

  //4) after submitting order, update ${product.sold} && ${product.quantity} properties
  // bulk lets you execute more than one operation(filter, then update) in one command.
  // iterating on each item within cart using map(), item== cart.cartItems
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product }, //find all products with provided id in cart.cartItems.product._id
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } }, // update: reduce item quantity , increment item.sold
      },
    }));

    await Product.bulkWrite(bulkOptions, {});
  }

  //5) clear user's cart
  await Cart.findByIdAndDelete(cart._id);
  res.status(201).json({
    status: "success",
    message: `Your order '${order._id}' had been successfully received.`,
    items: order.cartItems.length,
    data: order,
  });
});

exports.ordersFilter = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id }; // brings only logged user orders

  next(); // if admin, then you can get all orders
});

//@DESC get my orders
//@ROUTE GET /api/v1/order
//@ACCESS auth user-admin-manager
// factory.getAll() will bring data based on the filter,
//  if user, then brings only logged user orders
exports.getAllOrders = factory.getAll(Order, [
  {
    path: "user",
    select: "name",
  },
  {
    path: "cartItems.product",
    select: "name",
  },
]);

//@DESC get specific order by id
//@ROUTE GET /api/v1/order/getOne/:orderId
//@ACCESS auth user
exports.getOne = factory.getOne(Order, [
  {
    path: "user",
    select: "name",
  },
  {
    path: "cartItems.product",
    select: "name",
  },
]);

//@DESC change payment status by admin
//@ROUTE POST /api/v1/order/toPaid/:orderId
//@ACCESS auth admin-manager
exports.isPaidToTrue = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return next(new ApiError(`Order not found`, 404));

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    message: `order: '${order._id}' payment status changed to ${order.isPaid}, successfully.`,
    data: updatedOrder,
  });
});

//@DESC change delivery status by admin
//@ROUTE put /api/v1/order/toDelivered/:orderId
//@ACCESS auth admin-manager
exports.isDeliveredToTrue = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return next(new ApiError(`Order not found`, 404));

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    message: `order: '${order._id}' delivered successfully.`,
    data: updatedOrder,
  });
});

//@DESC get checkout session from stripe and send it as a response
//@ROUTE POST /api/v1/order/checkout-session
//@ACCESS auth user
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app setting added by admin
  const taxCost = 0;
  const shippingCost = 0;

  const user = await User.findById(req.user._id);
  //1) get cart based on user
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart)
    return next(new ApiError(`No cart with this user: ${req.user._id}`, 404));

  //2) get price from cart, check if there is a coupon or not
  // check if there is cart.totalPriceAfterDiscount,
  // assign its value to cartPrice, else keep regular total price
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxCost + shippingCost;

  let addrIndex = null;
  // using query here because we are using GET method where req.body is undefined.
  if (req.query.addressAlias) {
    addrIndex = user.addresses.findIndex(
      (address) => address.alias === req.query.addressAlias,
    );
  }
  let dropOffAddress =
    req.user.addresses[addrIndex] ||
    req.user.addresses[0] ||
    req.body.addressId;

  cart.shippingAddress = dropOffAddress;

  // 3) create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/order`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: String(cart._id),
    metadata: {
      shippingAddress: JSON.stringify(dropOffAddress || {}),
      userId: String(req.user._id),
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(totalOrderPrice * 100), // cents
          product_data: {
            name: `Order for ${req.user.name}`,
          },
        },
        quantity: 1,
      },
    ],
  });

  //4) send session as response
  res.status(200).json({
    status: "success",
    session,
  });
});

//@DESC get checkout session from stripe and send it as a response test
//@ROUTE POST /api/v1/order/checkout-session
//@ACCESS auth user
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig);
  } catch (err) {
    res.status(400).json(err.message);
    return;
  }
});
