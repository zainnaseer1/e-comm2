const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuid4 } = require("uuid"); // For generating unique IDs for file names, v4 is version 4 of uuid

const Brand = require("../models/brandModel.js");
const factory = require("./handlersFactory.js");
const { uploadSingleImage } = require("../middleware/uploadImageMiddleware.js");

const uploadBrandImage = uploadSingleImage("image"); // 'image' is the field name in the form-data
// Image processing using sharp
const resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(); // If no file is uploaded, proceed to the next middleware
  const fileName = `brand-${uuid4()}-${Date.now()}.jpeg`; // Generate a unique file name for the resized image
  console.log(req.file);
  // console.log("meow", fileName);
  // Process the image
  await sharp(req.file.buffer) // Use the file buffer from memory storage
    .resize(600, 600) // Resize to 600x600 pixels
    .toFormat("jpeg") // Convert to JPEG format
    .jpeg({ quality: 90 }) // Set JPEG quality to 90
    .toFile(`uploads/brands/resized-${fileName}`); // Save the processed image with 'resized-' prefix

  req.body.image = `resized-${fileName}`; // Save the image name to req.body to be used in the controller
  req.file.filename = `resized-${fileName}`; // Update req.file.filename to the new resized image name
  req.file.path = `uploads/brands/resized-${fileName}`; // Update req.file.path to point to the resized image
  console.log("Image resized and saved as:", req.file);

  next(); // Proceed to the next middleware
});

//@description: This function creates a new brand
//@route: POST /api/v1/brands
//@access: Private
const createBrand = factory.createOne(Brand);

// const createBrand = asyncHandler(async (req, res) => {
//   const { name, description } = req.body;

//   const newBrand = await Brand.create({
//     name,
//     slug: slugify(name),
//     description,
//   });
//   res.status(201).json({
//     status: "success",
//     data: {
//       brand: newBrand,
//     },
//   });
// });

//@description: This function retrieves all brands
//@route: GET /api/v1/brands
//@access: Public
const getBrands = factory.getAll(Brand);
// const getBrands = asyncHandler(async (req, res) => {
//   let features = new ApiFeatures(Brand.find(), req.query)
//     .filter()
//     .keywordSearch()
//     .sort()
//     .limitFields();
//   // .paginate();

//   const totalCount = await Brand.countDocuments(features.filterObj || {}); // Get total count of documents matching the filter
//   features.paginate(totalCount); // Apply pagination and send total count to the

//   const brands = await features.build();
//   res.status(200).json({
//     status: "success",
//     pagination: features.pagination,
//     data: {
//       brands,
//     },
//   });
// });

//@description: This function retrieves a brand by ID
//@route: GET /api/v1/brands/:id
//@access: Public
const getBrandById = factory.getOne(Brand);
// const getBrandById = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const brand = await Brand.findById(id);

//   if (!brand) {
//     return next(new ApiError(`No brand found with this ID:${id}`, 404)); // using next to pass error to global error handler
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       brand,
//     },
//   });
// });

//@description: This function updates a brand by ID
//@route: PATCH /api/v1/brands/:id
//@access: Private
const updateBrand = factory.updateOne(Brand);
// const updateBrand = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const updates = req.body;

//   const brand = await Brand.findByIdAndUpdate(
//     id,
//     { ...updates, ...(updates.name && { slug: slugify(updates.name) }) }, //If updates.name is falsy (e.g., null, undefined, empty string), it spreads false — which does nothing (since spreading false adds nothing).
//     { new: true },
//   ); // ...updates is the spread operator that copies all properties from
//   //  updates and paste them in new instance
//   if (!brand) {
//     return next(new ApiError(`No brand found with this ID:${id}`, 404)); // using next to pass error to global error handler
//   }
//   res.status(200).json({
//     status: "success",
//     data: {
//       brand,
//     },
//   });
// });

//@description: This function deletes a brand by ID
//@route: DELETE /api/v1/brands/:id
//@access: Private
const deleteBrand = factory.deleteOne(Brand);

// const deleteBrand = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const brand = await Brand.findByIdAndDelete(id);
//   if (!brand) {
//     return next(new ApiError(`No brand found with this ID:${id}`, 404)); // using next to pass error to global error handler
//   }
//   res.status(204).json({
//     status: "success",
//     data: null,
//   });
// });

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  deleteBrand,
  updateBrand,
  uploadBrandImage,
  resizeImage,
};
