const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
// const ApiFeatures = require("../utils/apiFeatures");
const User = require("../models/userModel");
const Product = require("../models/productModel");

//@DESC add product to wishlist
//@ROUTE POST /api/v1/wishlist/add
//@ACCESS auth user
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  // const user = await User.findById(req.user._id);
  // const name = req.body.wishlistName;

  // //check if already exists in his addresses array
  // const exists =
  //   Array.isArray(user.wishlist) && //some() checks if at least one condition exists
  //   user.wishlist.some((list) => (list.name || "").toLowerCase() === name);

  // if (!exists) user.wishlist.push(name);

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: { name: req.body.name } }, // adding value to an array using mongodb, it don't adds the item again if already exists
    },
    { new: true },
  );

  //   if (!user) return new ApiError(`User not found.`, 404);
  const product = await Product.findOne({ _id: req.body.productId }, "name");
  //   if (!product) return new ApiError(`Product not found.`, 404);
  res.status(200).json({
    status: "success",
    message: "added to wishlist.",
    data: product,
  });
});

//@DESC get products in wishlist
//@ROUTE POST /api/v1/wishlist/getAll
//@ACCESS auth user
exports.getWishlist = asyncHandler(async (req, res, next) => {
  // If you need to refresh the user from DB to get latest wishlist:
  const user = await User.findById(req.user._id).select("wishlist");
  //   if (!user) return new ApiError(`User not found.`, 404);
  user.wishlist ? user.wishlist : [];
  // fetch products whose _id is in the wishlist array
  const products = await Product.find({ _id: { $in: user.wishlist } }, "name");
  //   const result = await Product.countDocuments({ _id: { $in: user.wishlist } });

  return res.status(200).json({
    status: "success",
    results: products.length,
    data: products,
  });
});

//@DESC remove product from wishlist
//@ROUTE DELETE /api/v1/wishlist/remove/:id
//@ACCESS auth user
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.id }, // removing value from an array using mongodb.
    },
    { new: true },
  );
  if (!user) return new ApiError(`User not found.`, 404);
  const product = await Product.findOne({ _id: req.params.id }, "name");
  if (!product) return new ApiError(`Product not found.`, 404);

  res.status(200).json({
    status: "success",
    message: "item removed from your wishlist.",
    data: product,
  });
});
