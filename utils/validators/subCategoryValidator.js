const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware.js");

const createSubCategoryValidator = [
  check("name")
    .escape()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 24 })
    .withMessage("Name must be 2-24 characters long"),
  check("parentCategory")
    .escape()
    .notEmpty()
    .withMessage("ParentCategory is required")
    .isMongoId()
    .withMessage("Invalid ParentCategory format"),
  validatorMiddleware,
];

const getSubCategoryByIdValidator = [
  check("id")
    .escape()
    .isMongoId()
    .withMessage("Invalid category ID format")
    .notEmpty()
    .withMessage("Category ID is required"),
  validatorMiddleware,
];

const updateSubCategoryValidator = [
  check("id")
    .escape()
    .notEmpty()
    .withMessage("SubCategory ID is required")
    .isMongoId()
    .withMessage("Invalid SubCategory ID format"),
  validatorMiddleware,
];

const deleteSubCategoryValidator = [
  check("id")
    .escape()
    .notEmpty()
    .withMessage("SubCategory ID is required")
    .isMongoId()
    .withMessage("Invalid SubCategory ID format"),
  validatorMiddleware,
];

module.exports = {
  createSubCategoryValidator,
  getSubCategoryByIdValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
  // deleteAllSubCategoriesValidator,
};
