//routes
const categoryRoutes = require("./categoryRoutes.js");
const subCategoryRoutes = require("./subCategoryRoutes.js");
const brandRoutes = require("./brandRoutes.js");
const productRoutes = require("./productRoutes.js");

const userRoutes = require("./userRoutes.js");
const authRoutes = require("./authRoutes.js");

const reviewRoutes = require("./reviewRoutes.js");
const wishlistRoutes = require("./wishlistRoutes.js");
const addressRoutes = require("./addressRoutes.js");
const couponsRoutes = require("./couponRoutes.js");
const cartRoutes = require("./cartRoutes.js");
const orderRoutes = require("./orderRoutes.js");

exports.mountRoutes = (app) => {
  // mount category routes
  app.use("/api/v1/categories", categoryRoutes);
  // mount subcategory routes
  app.use("/api/v1/subcategories", subCategoryRoutes);
  // mount brand routes
  app.use("/api/v1/brands", brandRoutes);
  // mount product routes
  app.use("/api/v1/products", productRoutes);
  // mount user routes
  app.use("/api/v1/users", userRoutes);
  // auth
  app.use("/api/v1/auth", authRoutes);
  // review
  app.use("/api/v1/reviews", reviewRoutes);
  // wishlist routes
  app.use("/api/v1/wishlist", wishlistRoutes);
  // address routes
  app.use("/api/v1/addresses", addressRoutes);
  // coupon routes
  app.use("/api/v1/coupons", couponsRoutes);
  // cart routes
  app.use("/api/v1/cart", cartRoutes);
  // order routes
  app.use("/api/v1/order", orderRoutes);
};
