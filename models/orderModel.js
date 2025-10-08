const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "order must belong to a specific user."],
    },
    cartItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        color: String,
        quantity: Number,
        price: Number,
      },
    ],
    phone: { type: String, ref: "User" },
    shippingAddress: { type: Object },
    taxCost: { type: Number, default: 0 }, // set by admin
    shippingCost: { type: Number, default: 0 }, // set by admin
    totalOrderPrice: { type: Number },
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    transaction: { type: String, default: null },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  { timestamps: true },
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

Order.allowedFields = [];

module.exports = Order;
