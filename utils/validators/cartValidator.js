const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware.js");

exports.addProductToCartValidator = [
  check("productId")
    .trim()
    .notEmpty()
    .withMessage("Product Id is required.")
    .isMongoId()
    .bail(),

  check("color")
    .trim()
    .notEmpty()
    .withMessage("Color is required.")
    .bail()
    .toArray(),

  validatorMiddleware,
];

// const getBrandByIdValidator = [
//   check("id")
//     .escape()
//     .isMongoId()
//     .withMessage("Invalid brand ID format")
//     .notEmpty()
//     .withMessage("Brand ID is required"),
//   validatorMiddleware,
// ];

// const updateBrandByIdValidator = [
//   check("id")
//     .escape()
//     .isMongoId()
//     .withMessage("Invalid brand ID format")
//     .notEmpty()
//     .withMessage("Brand ID is required"),
//   validatorMiddleware,
// ];

// const deleteBrandByIdValidator = [
//   check("id")
//     .escape()
//     .isMongoId()
//     .withMessage("Invalid brand ID format")
//     .notEmpty()
//     .withMessage("Brand ID is required"),
//   validatorMiddleware,
// ];
