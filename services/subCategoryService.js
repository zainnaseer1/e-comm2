const asyncHandler = require("express-async-handler");
// const ApiError = require("../utils/apiError.js");
const SubCategory = require("../models/subCategoryModel.js");
// const ApiFeatures = require("../utils/apiFeatures.js");
const factory = require("./handlersFactory.js");

const setCategoryIdToBody = (req, res, next) => {
  //nested route to create subcategory in specific category
  if (!req.body.parentCategory) {
    //if no parent category passed in body then do:
    req.body.parentCategory = req.params.categoryId;
  }
  next();
};

//@description: This function creates a new subcategory
//@route: POST /api/v1/subcategories
//@access: Private
const createSubCategory = factory.createOne(SubCategory);

// Nested route
// GET /api/v1/categories/:categoryId/subcategories
exports.createFilterObj = (req, res, next) => {
  let filterObj = {};
  if (req.params.parentCategory)
    filterObj = { product: req.params.parentCategory };
  req.filterObj = filterObj;
  next();
};
//@description: This function retrieves all subcategories (with optional parent category filter)
//@route: GET /api/v1/subcategories
//@access: Public
const getSubCategories = factory.getAll(SubCategory);

//@description: This function retrieves a category by ID
//@route: GET /api/v1/categories/:id
//@access: Public
// let options = [
//   {
//     path: "parentCategory",
//     select: "name",
//   },
// ];
const getSubCategoryById = factory.getOne(SubCategory);
//@description: This function updates a subcategory by ID
//@route: PATCH /api/v1/subcategories/:id
//@access: Private
const updateSubCategory = factory.updateOne(SubCategory);

//@description: This function deletes a category by ID
//@route: DELETE /api/v1/categories/:id
//@access: Private
const deleteSubCategory = factory.deleteOne(SubCategory);

// Deletes all subcategories
const deleteAllSubCategories = asyncHandler(async (req, res, next) => {
  await SubCategory.deleteMany({});
  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  setCategoryIdToBody,
  // createFilterObject,
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  deleteAllSubCategories,
};
