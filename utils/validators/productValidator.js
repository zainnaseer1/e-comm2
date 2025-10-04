const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware.js");
const checker = require("../../middleware/validatorMiddleware.js");

const Category = require("../../models/categoryModel.js");
const SubCategory = require("../../models/subCategoryModel.js");
const Brand = require("../../models/brandModel.js");

const createProductValidator = [
  check("seq").escape(),
  check("name")
    .escape()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 40 characters long"),
  check("description")
    .escape()
    .optional()
    .isLength({ max: 500 })
    .withMessage("Product description must be less than 500 characters long"),
  check("price")
    .escape()
    .optional()
    // .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .toFloat(),
  check("priceAfterDiscount")
    .escape()
    .optional()
    .isNumeric()
    .withMessage("Product price after discount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      //value is the discounted price
      if (value && value >= req.body.price) {
        throw new Error(
          "Product price after discount must be less than the original price",
        );
      }
      return true; //only if priceAfterDiscount < originalPrice
    }),
  check("quantity")
    .escape()
    .optional()
    // .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold")
    .escape()
    .optional()
    .isNumeric()
    .withMessage("Product sold must be a number"),
  check("colors")
    .escape()
    .isMongoId()
    .isArray()
    .withMessage("Product colors must be an array")
    .optional()
    .custom((value) => {
      if (!value.every((color) => typeof color === "string")) {
        throw new Error("Each color must be a string");
      }
      return true;
    })
    .withMessage("Each color must be a string"),
  check("category")
    .escape()
    .isMongoId()
    .withMessage("Invalid product category ID format")
    .notEmpty()
    .withMessage("Product category is required")
    .custom(async (value) => {
      const category = await Category.findById(value);
      if (!category) {
        throw new Error("Product category does not exist");
      }
      return true;
    }),
  check("subcategory")
    .escape()
    .isMongoId()
    .withMessage("Invalid product subcategory ID format")
    .notEmpty()
    .withMessage("Product subcategory is required")
    .custom(async (value) => {
      // Check if subcategory exists
      SubCategory.find({
        _id: { $exists: true, $in: value },
      }).then((result) => {
        //result is an array of matching subcategories
        if (result.length < 1 || result.length !== value.length) {
          return Promise.reject(
            new Error("Product subcategory does not exist"),
          );
        }
        console.log("All subcategories exist", result);

        return true;
      });
    }) // inside createProductValidator
    .custom(async (value, { req }) => {
      // 1) make sure category exists
      const category = await Category.findById(req.body.category);
      if (!category) {
        throw new Error("Product category does not exist");
      }

      // 2) find all subcategories that belong to that category
      const subcategories = await SubCategory.find({
        parentCategory: req.body.category,
      }).select("_id");
      const subcategoryIdsInDb = subcategories.map((sc) => sc._id.toString());

      // 3) normalize incoming value (support a single id or array)
      const valueArray = Array.isArray(value) ? value : [value].filter(Boolean);

      // 4) check each provided id exists in the parent's subcategory list
      const invalid = valueArray.some((id) => !subcategoryIdsInDb.includes(id));
      if (invalid) {
        throw new Error("Product subcategory does not belong to the category");
      }

      // all good
      return true;
    }),

  // .custom(async (value, { req }) => {
  //   // Check if subcategory belongs to category
  //   const category = Category.findById(req.body.category);
  //   if (!category) {
  //     throw new Error("Product category does not exist");
  //   }
  //   console.log("1- Product category exists");
  //   SubCategory.find({
  //     parentCategory: category, //finds all subcategories for the given category
  //   }).then((subcategories) => {
  //     //subcategories now holds all subcategories for the given category
  //     // Extract IDs of subcategories from the database
  //     console.log("2- Subcategories in DB for this category:", subcategories);
  //     const subcategoryIdsInDb = [];
  //     // Map subcategories to their IDs
  //     subcategories.forEach((subcategory) => {
  //       //subcategory represents a subcategory inside subcategories
  //       //by "subcategories.forEach(subcategory)" we are iterating over each subcategory in subcategories
  //       //then push each subcategory into subcategoryIdsInDb
  //       subcategoryIdsInDb.push(subcategory._id.toString());
  //     });
  //     console.log("3- subcategories in", subcategoryIdsInDb);
  //     // checking if each "subcategory value(entered by user through body)" is in the subcategoryIdsInDb which holds all the subs of the main category in db
  //     if (!checker(value, subcategoryIdsInDb)) {
  //       throw new Error(
  //         "Product subcategory does not belong to the category",
  //       );
  //     }
  //     return true;
  //   });
  // }),

  check("brand")
    .escape()
    .isMongoId()
    .withMessage("Invalid product brand ID format")
    .optional()
    .withMessage("Product brand is required")
    .custom(async (value) => {
      const brand = await Brand.findById(value);
      if (!brand) {
        throw new Error("Product brand does not exist");
      }
      return true;
    }),
  check("imageCover")
    .escape()
    .notEmpty()
    .withMessage("Product image cover is required"),
  check("ratingsQuantity")
    .optional()
    .escape()
    .isNumeric()
    .withMessage("Product ratings quantity must be a number")
    .toFloat(),
  check("averageRating")
    .escape()
    .optional()
    .isNumeric()
    .isLength({ min: 0, max: 5 })
    .withMessage("Product ratings average must be a number between 1 and 5")
    .toFloat(),
  validatorMiddleware,
];

const getProductByIdValidator = [
  check("id")
    .escape()
    .isMongoId()
    .withMessage("Invalid product ID format")
    .notEmpty()
    .withMessage("Product ID is required"),
  validatorMiddleware,
];

const updateProductByIdValidator = [
  check("id")
    .escape()
    .isMongoId()
    .withMessage("Invalid product ID format")
    .notEmpty()
    .withMessage("Product ID is required"),
  check("category")
    .escape()
    .isMongoId()
    .withMessage("Invalid product category ID format")
    .optional()
    .custom(async (value) => {
      const category = await Category.findById(value);
      if (!category) {
        throw new Error("Product category does not exist");
      }
      return true;
    }),
  check("subcategory")
    .escape()
    .isMongoId()
    .withMessage("Invalid product subcategory ID format")
    .optional()
    .custom(async (value) => {
      // Check if subcategory exists
      SubCategory.find({
        _id: { $exists: true, $in: value },
      }).then((result) => {
        //result is an array of matching subcategories
        if (result.length < 1 || result.length !== value.length) {
          return Promise.reject(
            new Error("Product subcategory does not exist"),
          );
        }
        return true;
      });
    })
    .custom(async (value, { req }) => {
      // Check if subcategory belongs to category
      const category = await Category.findById(req.body.category);
      if (!category) {
        throw new Error("Product category does not exist");
      }
      const subcategories = SubCategory.find({
        parentCategory: category, //finds all subcategories for the given category
      }).then((subcategories) => {
        //subcategories now holds all subcategories for the given category
        // Extract IDs of subcategories from the database
        const subcategoryIdsInDb = [];
        // Map subcategories to their IDs
        subcategories.forEach((subcategory) => {
          //subcategory is an object
          subcategoryIdsInDb.push(subcategory._id.toString());
        });
        if (!checker(value, subcategoryIdsInDb)) {
          throw new Error(
            "Product subcategory does not belong to the category",
          );
        }
      });

      console.log("Subcategories in DB for this category:", subcategories);
    }),

  validatorMiddleware,
];

const deleteProductByIdValidator = [
  check("id")
    .escape()
    .isMongoId()
    .withMessage("Invalid product ID format")
    .notEmpty()
    .withMessage("Product ID is required"),
  validatorMiddleware,
];

module.exports = {
  createProductValidator,
  getProductByIdValidator,
  updateProductByIdValidator,
  deleteProductByIdValidator,
  // deleteProductByIdValidator: updateProductByIdValidator // Reusing the same validator for delete operation
};
