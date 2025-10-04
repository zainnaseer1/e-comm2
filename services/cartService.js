const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");

// function to calculate total cart price
const calcTotalPrice = (cart) => {
  let totalPrice = 0;

  cart.cartItems.forEach((product) => {
    totalPrice += product.quantity * product.price;
  });
  totalPrice = Math.round(totalPrice * 100) / 100;
  cart.totalCartPrice = totalPrice;
  return cart.totalCartPrice;
};

//@DESC add product to cart
//@ROUTE POST /api/v1/cart/add
//@ACCESS auth user
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await Product.findOne({ _id: productId }); // to show price

  //1) get cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  // if no cart for logged user, create one and insert product
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        { product: productId, color, price: product.price, quantity: 1 },
      ],
    });
  }
  // if user already has a cart
  else {
    //check if added product exists in cart or not
    const i = cart.cartItems.findIndex(
      (item) =>
        item?.color === color &&
        (item?.product?._id?.equals?.(productId) || // populated doc: compare its _id via ObjectId.equals
          item?.product?.equals?.(productId) || // unpopulated ref: product itself is an ObjectId with equals
          item?.product?._id?.toString?.() === String(productId) ||
          item?.product?.toString?.() === String(productId)),
    );
    // if item exists in cart just increment quantity by 1

    if (i !== -1) {
      cart.cartItems[i].quantity += 1;
    }

    // (if i== -1 then its not in cart)
    // if item doesn't exist, push it to cartItems array
    else {
      cart.cartItems.push({
        product: productId,
        color,
        quantity: 1,
        price: product.price,
      });
    }
  }
  // calculate total cart price
  calcTotalPrice(cart);

  await cart.save();
  res.status(200).json({
    status: "success",
    message: `product: '${productId}' added successfully.`,
    items: cart.cartItems.length,
    data: cart,
  });
});

//@DESC get cart
//@ROUTE GET /api/v1/cart/getAll
//@ACCESS auth user
exports.getCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart)
    return next(new ApiError(`No cart with this user: ${req.user._id}`, 404));

  res.status(200).json({
    status: "success",
    items: cart.cartItems.length,
    data: cart,
  });
});

//@DESC delete an item from cart
//@ROUTE PUT /api/v1/cart/delete/:itemId
//@ACCESS auth user
exports.deleteItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true, runValidators: true },
  );
  calcTotalPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    message: `item '${req.params.itemId}' deleted.`,
    items: cart.cartItems.length,
    data: cart,
  });
});

//@DESC discard all items from cart
//@ROUTE DELETE /api/v1/cart/clear
//@ACCESS auth user
exports.clearCart = asyncHandler(async (req, res, next) => {
  const deleted = await Cart.findOneAndDelete({ user: req.user._id });
  if (!deleted) return next(new ApiError("cart not found !", 404));
  res.status(204).send({ status: "success" });
});

//@DESC update  item quantity from cart page
//@ROUTE PUT /api/v1/cart/update/:itemId
//@ACCESS auth user
exports.updateItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart)
    return next(new ApiError(`cart not found for ${req.user._id}!`, 404));

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id == req.params.itemId,
  );
  if (itemIndex > -1) cart.cartItems[itemIndex].quantity = quantity;
  else
    return next(
      new ApiError(`No match with this item ${req.params.itemId}`, 404),
    );
  calcTotalPrice(cart);
  await cart.save();
  res
    .status(200)
    .json({ status: "success", results: cart.cartItems.length, data: cart });
});

//@DESC apply coupon on cart
//@ROUTE PUT /api/v1/cart/applyCoupon
//@ACCESS auth user
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  //1) receive coupon (name) from body
  //check if valid (not expired)

  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });
  if (!coupon) return next(new ApiError(`Invalid or expired Coupon`, 404));

  //2) get logged user cart to calculate total price after discount
  const cart = await Cart.findOne({ user: req.user._id });
  const totalPrice = cart.totalCartPrice;

  //3) calculate totalCartPriceAfterDiscount
  const totalAfterDiscount = Math.round(
    ((totalPrice - (totalPrice * coupon.discount) / 100) * 100) / 100, // *100 / 100 to estimate to nearest 2 decimals
  );
  cart.totalPriceAfterDiscount = totalAfterDiscount;
  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Coupon has been activated.",
    items: cart.cartItems.length,
    data: cart,
  });
});

//@DESC dismount coupon from user's cart
//@ROUTE PUT /api/v1/cart/dismountCoupon
//@ACCESS auth user
exports.dismountCoupon = asyncHandler(async (req, res, next) => {
  // get logged user cart
  const cart = await Cart.findOne({ user: req.user._id });
  cart.totalPriceAfterDiscount = undefined;
  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Coupon has been dismounted from this cart.",
    items: cart.cartItems.length,
    data: cart,
  });
});
