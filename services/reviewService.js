const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory.js");
const Review = require("../models/reviewModel.js");

exports.setProductIdAndUserToBody = (req, res, next) => {
  //nested route to create subcategory in specific category
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.product) req.body.user = req.user._id;
  next();
};
//@description: This function creates a new Review
//@route: POST /api/v1/reviews/createOne
//@access: Private/authenticated-user
exports.createReview = factory.createOne(Review, [
  { path: "user", select: "name _id" },
  { path: "product", select: "name _id" },
]);

exports.createFilterObj = (req, res, next) => {
  let filterObj = {};
  if (req.params.productId) filterObj = { product: req.params.productId };
  req.filterObj = filterObj;
  next();
};
//@description: This function retrieves all reviews
//@route: GET /api/v1/reviews/getAll
//@access: Public
exports.getReviews = factory.getAll(Review, [
  { path: "user", select: "name _id" },
  { path: "product", select: "name _id " },
]);

//@description: This function retrieves a Review by ID
//@route: GET /api/v1/reviews/getOne/:id
//@access: Public
exports.getReviewById = factory.getOne(Review, [
  { path: "user", select: "name _id" },
  { path: "product", select: "name _id" },
]);

//@description: This function updates a Review by ID
//@route: PATCH /api/v1/reviews/update/:id
//@access: Private/authenticated-user
exports.updateReview = factory.updateOne(Review);

//@description: This function retrieves reviews for a specific product with detailed product info
//@route: GET /api/v1/reviews/product/:productId
//@access: Public
exports.getReviewsForProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.find({ product: productId })
    .populate({
      path: "user",
      select: "name -_id",
    })
    .populate({
      path: "product",
      select: "name ratingsQuantity averageRating ",
    });

  res.status(200).json({
    status: "success",
    data: reviews,
  });
});

//@description: This function deletes a Review by ID
//@route: DELETE /api/v1/reviews/delete/:id
//@access: Private/authenticated-user
exports.deleteReview = factory.deleteOne(Review);
