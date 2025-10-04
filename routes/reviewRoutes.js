const express = require("express");
const auth = require("../services/authService.js");
const {
  createReview,
  getReviews,
  getReviewById,
  getReviewsForProduct,
  deleteReview,
  updateReview,
  createFilterObj,
  setProductIdAndUserToBody,
} = require("../services/reviewService.js");
const {
  createReviewValidator,
  getReviewByIdValidator,
  updateReviewByIdValidator,
  deleteReviewByIdValidator,
} = require("../utils/validators/reviewValidator.js");

// Initialize router
// to get access to params from parent router (Product)
const router = express.Router({ mergeParams: true }); //for ex. we want to access reviews from products route//middleware to parse JSON bodies

router.use(express.json());
router.use(auth.authenticated);

// Routes
// nested: GET /api/v1/products/:productId/reviews
router.get("/", createFilterObj, getReviewsForProduct);
router.post(
  "/",
  auth.allowedTo("user"),
  setProductIdAndUserToBody,
  createReview,
);

//create review
router.post(
  "/createOne",
  auth.allowedTo("user"),
  createReviewValidator,
  createReview,
);
//get all reviews
router.get("/getReviews", getReviews);
//get one review
router.get("/getOne/:id", getReviewByIdValidator, getReviewById);
//get reviews on specific product
router.get("/product/:productId", getReviewsForProduct);
//update specific product
router.put(
  "/update/:id",
  auth.allowedTo("user"),
  updateReviewByIdValidator,
  updateReview,
);
//delete specific product
router.delete(
  "/deleteOne/:id",
  auth.allowedTo("user", "manager", "admin"),
  deleteReviewByIdValidator,
  deleteReview,
);

module.exports = router;
