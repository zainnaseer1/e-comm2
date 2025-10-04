const Product = require("../models/productModel.js");
const factory = require("./handlersFactory.js");
const asyncHandler = require("express-async-handler");
const {
  uploadMultipleImages,
} = require("../middleware/uploadImageMiddleware.js");

const uploadProductImages = uploadMultipleImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 12 },
]);

const resizeProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files) return next();
  // console.log(req.files);
  if (req.files.imageCover) {
    const imageCoverFilename = `product-${uuid4()}-${Date.now()}-cover.jpeg`; // e.g., product-1632345678901-cover.jpeg

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/resized-${imageCoverFilename}`);

    req.body.imageCover = `resized-${imageCoverFilename}`;
    req.files.imageCover[0].filename = `resized-${imageCoverFilename}`;
    req.files.imageCover[0].path = `uploads/products/resized-${imageCoverFilename}`;
  }

  //images gallery for product
  if (req.files.images && req.files.images.length > 0) {
    req.body.images = [];
    // eslint-disable-next-line no-unused-vars
    let db = req.body.images;
    await Promise.all(
      req.files.images.map(async (img, i) => {
        const filename = `product-${uuid4()}-${Date.now()}-${i + 1}.jpeg`;
        //img =req.files.images[current]
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/products/resized-${filename}`);

        req.body.images.push(`resized-${filename}`);
        req.files.images[i].filename = `resized-${filename}`;
        req.files.images[i].path = `uploads/products/resized-${filename}`;
      }),
    );
    // console.log(req.files);
    next();
  }
});

//@description: This function creates a new product
//@route: POST /api/v1/products
//@access: Private
// const allowedFields = [];
// const [
//   seq,
//   name,
//   description,
//   price,
//   priceAfterDiscount,
//   sold,
//   colors,
//   quantity,
//   category,
//   subcategory,
//   brand,
//   imageCover,
//   images,
// ] = allowedFields;
const createProduct = factory.createOne(Product, [
  { path: "category", select: "name _id" },
  { path: "subcategory", select: "name _id" },
  { path: "brand", select: "name _id" },
]);

//   const newProduct = await Product.create({
//     // seq, //auto increment
//     name,
//     slug: slugify(name),
//     description,
//     price,
//     // priceAfterDiscount,
//     colors,
//     quantity,
//     // sold,
//     category,
//     subcategory,
//     brand,
//     imageCover,
//     images,
//   });
//   res.status(201).json({
//     status: "success",
//     data: {
//       newProduct,
//     },
//   });
// });

//@description: This function retrieves all products
//@route: GET /api/v1/products
//@access: Public
// const options = [
//   {
//     path: "category",
//     select: "name",
//   },
//   {
//     path: "subcategory",
//     select: "name",
//   },
//   {
//     path: "brand",
//     select: "name",
//   },
// ];
const getProducts = factory.getAll(Product, [
  { path: "category", select: "name _id" },
  { path: "subcategory", select: "name _id" },
  { path: "brand", select: "name _id" },
]);

//@description: This function retrieves a product by ID
//@route: GET /api/v1/products/:id
//@access: Public
const getProductById = factory.getOne(Product, [
  { path: "category", select: "name _id" },
  { path: "subcategory", select: "name _id" },
  { path: "brand", select: "name _id" },
  { path: "reviews", select: "name _id" },
]);

//@description: This function updates a product by ID
//@route: PATCH /api/v1/products/:id
//@access: Private
const updateProduct = factory.updateOne(Product);

//@description: This function deletes a product by ID
//@route: DELETE /api/v1/products/:id
//@access: Private
const deleteProduct = factory.deleteOne(Product);

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  uploadProductImages,
  resizeProductImages,
};
