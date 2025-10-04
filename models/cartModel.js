const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        color: String,
        quantity: { type: Number, default: 1 },
        price: Number,
      },
    ],
    totalCartPrice: {
      type: Number,
    },
    totalPriceAfterDiscount: {
      type: Number,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "cart must belong to a specific user."],
    },
  },
  { timestamps: true },
);

const Cart = mongoose.model("Cart", cartSchema) || mongoose.models.Cart;

Cart.allowedFields = [
  "cartItems",
  "totalCartPrice",
  "totalPriceAfterDiscount",
  "user",
];

module.exports = Cart;
