const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuid4 } = require("uuid"); // For generating unique IDs for file names, v4 is version 4 of uuid

const Category = require("../models/categoryModel.js");
const factory = require("./handlersFactory.js");
const { uploadSingleImage } = require("../middleware/uploadImageMiddleware.js");

const uploadCategoryImage = uploadSingleImage("image"); // 'image' is the field name in the form-data

// Image processing using sharp
const resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(); // If no file is uploaded, proceed to the next middleware
  const fileName = `category-${uuid4()}-${Date.now()}.jpeg`; // Generate a unique file name for the resized image

  // Process the image
  await sharp(req.file.buffer) // Use the file buffer from memory storage
    .resize(600, 600) // Resize to 600x600 pixels
    .toFormat("jpeg") // Convert to JPEG format
    .jpeg({ quality: 90 }) // Set JPEG quality to 90
    .toFile(`uploads/categories/resized-${fileName}`); // Save the processed image with 'resized-' prefix

  req.body.image = `resized-${fileName}`; // Save the image name to req.body to be used in the controller
  req.file.filename = `resized-${fileName}`; // Update req.file.filename to the new resized image name
  req.file.path = `uploads/categories/resized-${fileName}`; // Update req.file.path to point to the resized image
  console.log("Image resized and saved as:", req.file.path, req.file);

  next(); // Proceed to the next middleware
});

//@description: This function creates a new category
//@route: POST /api/v1/categories
//@access: Private
const createCategory = factory.createOne(Category);

//@description: This function retrieves all categories
//@route: GET /api/v1/categories
//@access: Public
const getCategories = factory.getAll(Category);

//@description: This function retrieves a category by ID
//@route: GET /api/v1/categories/:id
//@access: Public
const getCategoryById = factory.getOne(Category);

//@description: This function updates a category by ID
//@route: PATCH /api/v1/categories/:id
//@access: Private
const updateCategory = factory.updateOne(Category);

//@description: This function deletes a category by ID
//@route: DELETE /api/v1/categories/:id
//@access: Private
const deleteCategory = factory.deleteOne(Category);

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  deleteCategory,
  updateCategory,
  uploadCategoryImage,
  resizeImage,
};
