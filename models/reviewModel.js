const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  rating: {
    type: Number,
    min: [1, "Minimum rating number is '1'. "],
    max: [5, "Maximum rating number is '5'."],
    required: [true, "Review rating is required."],
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  },
  // parent reference , every product has many reviews
  product: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Product",
    required: [true, "Review must be attached to a specific product."],
  },
});

function toNumberWith2Decimals(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

reviewSchema.statics.calcAverageRatingAndQuantity = async function (productId) {
  const reviews = await this.aggregate([
    //stage 1: get all reviews on specific product
    { $match: { product: productId } },
    //stage 2: group reviews by product id find number of reviews on this product, and average rating
    {
      $group: {
        _id: "$product",
        ratingsQuantity: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log(reviews);

  if (reviews.length > 0)
    await Product.findByIdAndUpdate(productId, {
      //reviews is an array of index 0
      ratingsQuantity: toNumberWith2Decimals(reviews[0].ratingsQuantity),
      averageRating: toNumberWith2Decimals(reviews[0].averageRating),
    });
  else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      averageRating: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingAndQuantity(this.product);
});

reviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRatingAndQuantity(this.product);
});

const Review = mongoose.model("Review", reviewSchema) || mongoose.models.Review;

Review.allowedFields = ["title", "rating", "user", "product"]; // Add allowedFields as a static property of the Brand model

module.exports = Review;
