const mongoose = require("mongoose");

//1- create schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: [true, "Brand name must be unique"],
      minlength: [2, "Brand name must be at least 2 characters long"],
      maxlength: [32, "Brand name must be at most 32 characters long"],
      trim: true,
    },
    slug: {
      //slug is a URL-friendly version of the brand name
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [false, "Brand description is optional"],
    },
    image: {
      type: String,
      required: [false, "Brand image is optional"],
    },
  },
  { timestamps: true },
); //timestamps is a mongoose option that adds createdAt and updatedAt fields to the schema
// Function to set full image URL
const setImageURL = (doc) => {
  if (doc.image) {
    doc.image = `${process.env.BASE_URL}/brands/${doc.image}`; // Assuming images are served from /categories endpoint
    return doc.image;
  }
};
//post init hook to modify the image field to include the full URL
brandSchema.post("init", (doc) => {
  setImageURL(doc);
});
//post save
brandSchema.post("save", (doc) => {
  setImageURL(doc);
});

//2- create model
const Brand = mongoose.models.Brand || mongoose.model("Brand", brandSchema); //model name is singular

Brand.allowedFields = ["name", "description", "image"]; // Add allowedFields as a static property of the Brand model

//3- export model
module.exports = Brand; //exporting the model
