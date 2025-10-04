const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Coupon must hold a name."],
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, "Must provide coupon expire date."],
    },
    discount: {
      type: Number,
      required: [true, "Please submit coupon discount value."],
    },
  },
  { timestamps: true },
);

const Coupon = mongoose.model("Coupon", couponSchema) || mongoose.models.Coupon;

Coupon.allowedFields = ["name", "expire", "discount"];

module.exports = Coupon;
