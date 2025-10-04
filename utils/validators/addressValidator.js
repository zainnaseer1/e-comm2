const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware.js");
// const ApiError = require("../apiError.js");
const User = require("../../models/userModel.js");

exports.addAddressValidator = [
  check("").custom(async (val, { req }) => {
    const user = await User.findOne({ _id: req.user._id }).select(
      "addresses._id",
    );
    if (!user || !Array.isArray(user.addresses)) return true;
    // Prevent adding a 6th address
    if (user.addresses.length >= 5)
      throw new Error("Cant save more than 5 addresses.");
    return true;
  }),
  check("alias")
    .trim()
    .notEmpty()
    .withMessage("address alias is required.")
    .bail()
    .custom(async (value, { req }) => {
      // Ensure alias is unique per user (case-insensitive)
      const user = await User.findById(req.user._id).select("addresses.alias");
      if (!user) throw new Error("User not found.");
      //value entered by user
      const aliasLower = value.toLowerCase();
      //check if already exists in his addresses array
      const exists =
        Array.isArray(user.addresses) && //some() checks if at least one condition exists
        user.addresses.some(
          (addr) => (addr.alias || "").toLowerCase() === aliasLower,
        );

      if (exists) throw new Error("Please choose a unique address alias.");

      return true;
    })
    .escape(),
  check("phone")
    .customSanitizer(async (val, { req }) => {
      const user = await User.findOne({ _id: req.user._id }, "phone");
      return user.phone;
    })
    .trim()
    .isMobilePhone(["ar-IQ", "ar-AE", "ar-JO", "ar-KW", "ar-LB"])
    .custom(async (val, { req }) => {
      if (req.body.phone) val = req.body.phone;
      return val;
    })
    .escape(),
  validatorMiddleware,
];

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
