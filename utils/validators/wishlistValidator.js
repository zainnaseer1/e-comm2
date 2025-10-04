const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware.js");
// const ApiError = require("../apiError.js");
const User = require("../../models/userModel.js");

exports.addToWishlistValidator = [
  check("user")
    .customSanitizer((val, { req }) => req.user._id)
    .isMongoId()
    .withMessage("Invalid user id (not a MongoId)")
    .bail(),
  check("productId")
    .trim()
    .notEmpty()
    .withMessage("Please insert a product id to add to wishlist.")
    .bail()
    .isMongoId()
    .withMessage("Please insert a valid product id to add to wishlist.")
    .bail()
    .custom(async (value, { req }) => {
      const isInWishlist = await User.findOne({
        _id: req.user._id,
        wishlist: value,
      });
      if (isInWishlist) {
        // throw to signal a validation failure to express-validator
        throw new Error("Item already exists in wishlist.");
      }
      return true;
    })
    // do sanitization after validation if needed
    .escape(),
  validatorMiddleware,
];

// const getUserByIdValidator = [
//   check("id")
//     .escape()
//     .notEmpty()
//     .withMessage("User ID is required")
//     .isMongoId()
//     .withMessage("Invalid User ID format"),
//   validatorMiddleware,
// ];

// const updateUserByIdValidator = [
//   check("user")
//     .customSanitizer((val, { req }) => req.user._id)
//     .isMongoId()
//     .withMessage("Invalid user id (not a MongoId)")
//     .optional(),

//   // Validate and authorize User ID
//   check("id")
//     .notEmpty()
//     .withMessage("User ID is required")
//     .isMongoId()
//     .withMessage("Invalid User ID format")
//     .custom(
//       asyncHandler(async (val, { req }) => {
//         const rev = await User.findOne({
//           _id: req.params.id,
//           user: req.user._id,
//         });

//         if (!rev) throw new ApiError("Can not access this User", 401);

//         return true;
//       }),
//     ),

//   check("title")
//     .escape()
//     .optional()
//     .isLength({ min: 2, max: 200 })
//     .withMessage("User name must be between 2 and 200 characters long"),

//   check("rating")
//     .escape()
//     .optional()
//     .isFloat({ min: 1, max: 5 })
//     .withMessage("Rating value must be between 1 and 5 ."),

//   check("product")
//     .escape()
//     .optional()
//     .isMongoId()
//     .withMessage("please insert a valid product id."),
//   validatorMiddleware,
// ];

// const deleteUserByIdValidator = [
//   check("id")
//     .escape()
//     .notEmpty()
//     .withMessage("User ID is required")
//     .isMongoId()
//     .withMessage("Invalid User ID format")
//     .custom(async (val, { req }) => {
//       if (req.user.role == "user") {
//         let rev = await User.findOne({
//           _id: req.params.id,
//           user: req.user._id,
//         });
//         if (!rev) throw new ApiError(`Can not delete this User.`, 401);
//       } else {
//         let rev = await User.findOne({
//           _id: req.params._id,
//         });
//         if (!rev) throw new ApiError(`Can not find such User.`, 404);
//       }
//       return true;
//     }),
//   validatorMiddleware,
// ];
