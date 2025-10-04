const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware.js");

const createBrandValidator = [
  check("name")
    .escape()
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 2, max: 40 })
    .withMessage("Brand name must be between 2 and 40 characters long"),
  check("description")
    .escape()
    .optional()
    .isLength({ max: 500 })
    .withMessage("Brand description must be less than 500 characters long"),
  validatorMiddleware,
];

const getBrandByIdValidator = [
  check("id")
    .escape()
    .isMongoId()
    .withMessage("Invalid brand ID format")
    .notEmpty()
    .withMessage("Brand ID is required"),
  validatorMiddleware,
];

const updateBrandByIdValidator = [
  check("id")
    .escape()
    .isMongoId()
    .withMessage("Invalid brand ID format")
    .notEmpty()
    .withMessage("Brand ID is required"),
  validatorMiddleware,
];

const deleteBrandByIdValidator = [
  check("id")
    .escape()
    .isMongoId()
    .withMessage("Invalid brand ID format")
    .notEmpty()
    .withMessage("Brand ID is required"),
  validatorMiddleware,
];

module.exports = {
  createBrandValidator,
  getBrandByIdValidator,
  updateBrandByIdValidator,
  deleteBrandByIdValidator,
  // deleteBrandByIdValidator: updateBrandByIdValidator // Reusing the same validator for delete operation
};
