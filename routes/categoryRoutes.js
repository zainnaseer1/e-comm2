const express = require("express");
const auth = require("../services/authService.js");
const {
  createCategory,
  getCategories,
  getCategoryById,
  deleteCategory,
  updateCategory,
  uploadCategoryImage,
  resizeImage,
} = require("../services/categoryService.js");
const {
  createCategoryValidator,
  getCategoryByIdValidator,
  updateCategoryByIdValidator,
  deleteCategoryByIdValidator,
} = require("../utils/validators/categoryValidator.js");

// Import subcategory routes for nested routing
const subCategoryRoutes = require("./subCategoryRoutes.js");

// Initialize router
const router = express.Router();
//middleware to parse JSON bodies
router.use(express.json());
// Nested routes
router.use("/:categoryId/subcategories", subCategoryRoutes);

// Routes
router
  .route("/")
  .post(
    auth.authenticated,
    auth.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidator,
    createCategory,
  )
  //req.file contains the uploaded("image") file
  .get(auth.authenticated, getCategories);

router
  .route("/:id")
  .get(getCategoryByIdValidator, getCategoryById)
  .delete(
    auth.authenticated,
    auth.allowedTo("admin"),
    deleteCategoryByIdValidator,
    deleteCategory,
  )
  .put(
    auth.authenticated,
    auth.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    updateCategoryByIdValidator,
    updateCategory,
  ); // api handler is updateCategory

module.exports = router;
