const express = require("express");
const auth = require("../services/authService.js");
const {
  createBrand,
  getBrands,
  getBrandById,
  deleteBrand,
  updateBrand,
  uploadBrandImage,
  resizeImage,
} = require("../services/brandService.js");
const {
  createBrandValidator,
  getBrandByIdValidator,
  updateBrandByIdValidator,
  deleteBrandByIdValidator,
} = require("../utils/validators/brandValidator.js");

// Initialize router
const router = express.Router();
//middleware
router.use(express.json());

// Routes
router
  .route("/")
  .post(
    auth.authenticated,
    auth.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    createBrandValidator,
    createBrand,
  )
  .get(getBrands);

router
  .route("/:id")
  .get(getBrandByIdValidator, getBrandById)
  .put(
    auth.authenticated,
    auth.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    updateBrandByIdValidator,
    updateBrand,
  ) // api handler is updateBrand
  .delete(
    auth.authenticated,
    auth.allowedTo("admin"),
    deleteBrandByIdValidator,
    deleteBrand,
  );

module.exports = router;
