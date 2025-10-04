const mongoose = require("mongoose");

//1- create schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: [true, "Category name must be unique"],
      minlength: [2, "Category name must be at least 2 characters long"],
      maxlength: [32, "Category name must be at most 32 characters long"],
      trim: true,
    },
    slug: {
      //slug is a URL-friendly version of the category name
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [false, "Category description is optional"],
    },
    image: {
      type: String,
      required: [false, "Category image is optional"],
    },
  },
  //timestamps is a mongoose option that adds createdAt and updatedAt fields to the schema
  { timestamps: true },
);
// Function to set full image URL
const setImageURL = (doc) => {
  if (doc.image) {
    doc.image = `${process.env.BASE_URL}/categories/${doc.image}`; // Assuming images are served from /categories endpoint
    return doc.image;
  }
};
//post init hook to modify the image field to include the full URL, works on find and findOne and update, but not on create
categorySchema.post("init", (doc) => {
  setImageURL(doc);
});
//post save hook to modify the image field to include the full URL, works on create
categorySchema.post("save", (doc) => {
  setImageURL(doc);
});

//2- create model
const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema); //model name is singular

Category.allowedFields = ["name", "slug", "description", "image"]; // Add allowedFields as a static property of the Category model

//3- export model
module.exports = Category; //exporting the model
