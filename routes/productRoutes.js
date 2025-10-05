const express = require("express");
const auth = require("../services/authService.js");
// Services
const {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../services/productService.js");
// Validators
const {
  createProductValidator,
  getProductByIdValidator,
  updateProductByIdValidator,
  deleteProductByIdValidator,
} = require("../utils/validators/productValidator.js");

const reviewRoutes = require("./reviewRoutes.js");

// Initialize router
const router = express.Router();
//middleware
router.use(express.json());
// Nested routes
router.use("/:productId/reviews", reviewRoutes);

// Routes
router
  .route("/")
  .post(
    auth.authenticated,
    auth.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct,
  )
  .get(getProducts);

router
  .route("/:id")
  .get(getProductByIdValidator, getProductById)
  .delete(
    auth.authenticated,
    auth.allowedTo("admin"),
    deleteProductByIdValidator,
    deleteProduct,
  )
  .put(
    auth.authenticated,
    auth.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    updateProductByIdValidator,
    updateProduct,
  );

module.exports = router;
