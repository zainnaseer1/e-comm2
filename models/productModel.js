const mongoose = require("mongoose");
const Counter = require("./counter.js");

const productSchema = new mongoose.Schema(
  {
    seq: {
      type: Number,
      unique: true,
      index: true, // Add index for faster queries
    }, //auto increment
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
      maxlength: [100, "Product name must be less than 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
      maxlength: [500, "Product description must be less than 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
      min: [0, "Product price must be positive"],
      max: [10000000, "Product price must be less than 10,000,000"],
    },
    priceAfterDiscount: {
      type: Number,
      min: [0, "Product price after discount must be positive"],
      optional: true,
    },
    colors: {
      type: [String], //array because multiple colors can be assigned to a product
      required: [true, "Please provide product colors"],
    },
    quantity: {
      type: Number,
      required: [true, "Please provide a product quantity"],
      min: [0, "Product quantity must be positive"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
        required: true,
      },
    ],
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: false,
    },
    images: {
      type: [String],
    },
    imageCover: {
      type: String,
      required: [true, "Please provide a product image cover"],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be above or equal to 1.0"],
      max: [5, "Rating must be below or equal to 5.0"],
      //   default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// add virtual "reviews" field to product, when foreign field(in Review) == localField in Product "_id"
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product", // product field inside reviews contains product id
  localField: "_id", // local product id within product model
});

// Before validate/save for new docs, get the next seq
productSchema.pre("validate", async function (next) {
  if (!this.isNew) return next(); // Only for new documents

  // If seq already provided (e.g. seeder) skip
  if (typeof this.seq === "number") return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: "product_seq" }, // counter id for this model
      { $inc: { seq: 1 } }, // atomic increment
      { new: true, upsert: true }, // create if missing
    );
    this.seq = counter.seq; // assign the incremented seq to the document
    next();
  } catch (err) {
    next(err);
  }
});

// async function resetProductSeqTo1() {
//   // set seq to 0 so next created product gets 1
//   await Counter.findOneAndUpdate(
//     { _id: "product_seq" },
//     { $set: { seq: 11 } },
//     { upsert: true },
//   );
// }
// Call this function when you want to reset the sequence
//resetProductSeqTo1().catch(console.error);

// Function to set full image URL
const setImageURL = (doc) => {
  if (doc.imageCover) {
    doc.imageCover = `${process.env.BASE_URL}/products/${doc.imageCover}`;
  }

  // Multiple images
  if (doc.images && doc.images.length > 0) {
    doc.images = doc.images.map(
      (img) => `${process.env.BASE_URL}/products/${img}`,
    );
  }
  // console.log(doc);
  return doc;
};

//post init hook to modify the image field to include the full URL, works on find and findOne and update, but not on create
productSchema.post("init", (doc) => {
  setImageURL(doc);
});
//post save hook to modify the image field to include the full URL, works on create
productSchema.post("save", (doc) => {
  setImageURL(doc);
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

Product.allowedFields = [
  "seq",
  "name",
  "slug",
  "description",
  "price",
  "priceAfterDiscount",
  "sold",
  "colors",
  "quantity",
  "category",
  "averageRating",
  "ratingsQuantity",
  "subcategory",
  "brand",
  "imageCover",
  "images",
];

module.exports = Product;
