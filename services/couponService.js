const Coupon = require("../models/couponModel.js");
const factory = require("./handlersFactory.js");

//@description: This function creates a new Coupon
//@route: POST /api/v1/coupons/add
//@access: private- admin-manager
exports.createCoupon = factory.createOne(Coupon);

//@description: This function retrieves all Coupons
//@route: GET /api/v1/coupons
//@access: private- admin-manager
exports.getCoupons = factory.getAll(Coupon);

//@description: This function retrieves a Coupon by ID
//@route: GET /api/v1/coupons/getOne/:id
//@access: private- admin-manager
exports.getCouponById = factory.getOne(Coupon);

//@description: This function updates a Coupon by ID
//@route: PATCH /api/v1/coupons/update/:id
//@access: private- admin-manager
exports.updateCoupon = factory.updateOne(Coupon);

//@description: This function deletes a Coupon by ID
//@route: DELETE /api/v1/coupons/delete/:id
//@access: private- admin-manager
exports.deleteCoupon = factory.deleteOne(Coupon);
