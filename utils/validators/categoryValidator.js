const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware.js");

const createCategoryValidator = [
  check("name")
    .escape()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 40 })
    .withMessage("Category name must be between 2 and 40 characters long"),
  check("description")
    .escape()
    .optional()
    .isLength({ max: 500 })
    .withMessage("Category description must be less than 500 characters long"),
  validatorMiddleware,
];

const getCategoryByIdValidator = [
  check("id")
    .escape()
    .isMongoId()
    .withMessage("Invalid category ID format")
    .notEmpty()
    .withMessage("Category ID is required"),
  validatorMiddleware,
];

const updateCategoryByIdValidator = [
  check("id")
    .escape()
    .isMongoId()
    .withMessage("Invalid category ID format")
    .notEmpty()
    .withMessage("Category ID is required"),
  validatorMiddleware,
];

const deleteCategoryByIdValidator = [
  check("id")
    .escape()
    .isMongoId()
    .withMessage("Invalid category ID format")
    .notEmpty()
    .withMessage("Category ID is required"),
  validatorMiddleware,
];

module.exports = {
  createCategoryValidator,
  getCategoryByIdValidator,
  updateCategoryByIdValidator,
  deleteCategoryByIdValidator,
  // deleteCategoryByIdValidator: updateCategoryByIdValidator // Reusing the same validator for delete operation
};
