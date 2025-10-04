const mongoose = require("mongoose");
// const CategoryModel = require("./categoryModel.js"); // Assuming you have a Category model
const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: [true, "SubCategory name must be unique"],
      minlength: [2, "SubCategory name must be at least 2 characters long"],
      maxlength: [32, "SubCategory name must be at most 32 characters long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId, //
      ref: "Category", // Reference to Category model
      required: [true, "SubCategory must belong to a parent category"],
    },
  },
  { timestamps: true },
);

//mongoose populate
subCategorySchema.post("save", function (next) {
  this.populate({ path: "parentCategory", select: "name" });

  next();
});

subCategorySchema.pre("find", function (next) {
  if (!next() == "review") {
    this.populate({ path: "parentCategory", select: "name -_id" });
  }
  next();
});
subCategorySchema.pre("findOne", function (next) {
  this.populate({ path: "parentCategory", select: "name" });
  next();
});

const SubCategory =
  mongoose.models.SubCategory ||
  mongoose.model("SubCategory", subCategorySchema);

SubCategory.allowedFields = ["name", "parentCategory"];
module.exports = SubCategory;
