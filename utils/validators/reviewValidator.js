const { check } = require("express-validator");
const asyncHandler = require("express-async-handler");
const validatorMiddleware = require("../../middleware/validatorMiddleware.js");
const ApiError = require("../apiError.js");
const Review = require("../../models/reviewModel.js");

const createReviewValidator = [
  check("user")
    .customSanitizer((val, { req }) => req.user._id) // inject logged-in user id
    .escape()
    .isMongoId()
    .withMessage("Invalid user id (not a MongoId)")
    .notEmpty()
    .custom(async (val, { req }) => {
      if (!val) val = req.user._id;
      return val;
    }),

  check("title")
    .escape()
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage("Review name must be between 2 and 200 characters long"),

  check("rating")
    .escape()
    .notEmpty()
    .withMessage("Please submit your rating to publish your review.")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating value must be between 1 and 5 ."),

  check("product")
    .escape()
    .notEmpty()
    .withMessage("please insert product id.")
    .isMongoId()
    .withMessage("please insert a valid product id.")
    .custom(async (val, { req }) => {
      //check if logged user has uploaded a previous review on the same product
      const previousReview = await Review.findOne({
        user: req.user._id,
        product: req.body.product,
      });
      if (previousReview)
        throw new ApiError(`You can only submit one review per item.`, 401);
    }),
  validatorMiddleware,
];

const getReviewByIdValidator = [
  check("id")
    .escape()
    .notEmpty()
    .withMessage("Review ID is required")
    .isMongoId()
    .withMessage("Invalid review ID format"),
  validatorMiddleware,
];

const updateReviewByIdValidator = [
  check("user")
    .customSanitizer((val, { req }) => req.user._id)
    .isMongoId()
    .withMessage("Invalid user id (not a MongoId)")
    .optional(),

  // Validate and authorize review ID
  check("id")
    .notEmpty()
    .withMessage("Review ID is required")
    .isMongoId()
    .withMessage("Invalid Review ID format")
    .custom(
      asyncHandler(async (val, { req }) => {
        const rev = await Review.findOne({
          _id: req.params.id,
          user: req.user._id,
        });

        if (!rev) throw new ApiError("Can not access this review", 401);

        return true;
      }),
    ),

  check("title")
    .escape()
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage("Review name must be between 2 and 200 characters long"),

  check("rating")
    .escape()
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating value must be between 1 and 5 ."),

  check("product")
    .escape()
    .optional()
    .isMongoId()
    .withMessage("please insert a valid product id."),
  validatorMiddleware,
];

const deleteReviewByIdValidator = [
  check("id")
    .escape()
    .notEmpty()
    .withMessage("Review ID is required")
    .isMongoId()
    .withMessage("Invalid Review ID format")
    .custom(async (val, { req }) => {
      if (req.user.role == "user") {
        let rev = await Review.findOne({
          _id: req.params.id,
          user: req.user._id,
        });
        if (!rev) throw new ApiError(`Can not delete this review.`, 401);
      } else {
        let rev = await Review.findOne({
          _id: req.params._id,
        });
        if (!rev) throw new ApiError(`Can not find such review.`, 404);
      }
      return true;
    }),
  validatorMiddleware,
];

module.exports = {
  createReviewValidator,
  getReviewByIdValidator,
  updateReviewByIdValidator,
  deleteReviewByIdValidator,
  // deleteReviewByIdValidator: updateReviewByIdValidator // Reusing the same validator
};
