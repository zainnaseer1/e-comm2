const express = require("express");
const auth = require("../services/authService.js");
const {
  setCategoryIdToBody,
  // createFilterObject,
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  deleteAllSubCategories,
} = require("../services/subCategoryService.js");
const {
  createSubCategoryValidator,
  getSubCategoryByIdValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
  // deleteAllSubCategoriesValidator,
} = require("../utils/validators/subCategoryValidator.js");

// to get access to params from parent router (categoryId)
const router = express.Router({ mergeParams: true }); //for ex. we want to access subcategories from category route
router.use(express.json());
//route: /api/v1/subcategories or /api/v1/categories/:categoryId/subcategories
router
  .route("/")
  .post(
    auth.authenticated,
    auth.allowedTo("admin", "manager"),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory,
  )
  .get(auth.authenticated, getSubCategories);

router
  .route("/:id")
  .get(getSubCategoryByIdValidator, getSubCategoryById)
  .put(
    auth.authenticated,
    auth.allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory,
  )
  .delete(
    auth.authenticated,
    auth.allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory,
  );

router.route("/delete/all").delete(deleteAllSubCategories);

module.exports = router;
