const multer = require("multer"); // * see multer documentation
const ApiError = require("../utils/apiError.js");

// middleware to set diskStorage and multer settings
const multerOptions = () => {
  //1) Disk storage , save file to disk, uses disk storage because it won't be processed
  // const multerStorage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     //cb is callback function, first argument is error, second is destination
  //     cb(null, "uploads/categories");
  //   },
  //   // Set the file name
  //   filename: (req, file, cb) => {
  //     const ext = file.mimetype.split("/")[1]; // Get file extension from mimetype, split at '/' and take second part
  //     const uniqueSuffix = `${uuid4()}-${Date.now()}`; // Generate unique suffix using uuid and timestamp
  //     cb(null, `category-${uniqueSuffix}.${ext}`); // Set the file name
  //     // e.g., category-1632345678901.png,
  //   }, //can be accessed using req.file.filename in controller
  // });

  //   2) Memory storage, store file in memory as buffer
  //   // upload.single(fieldName); // 'image' is the field name in the form-data
  //   // upload.single() is a middleware that processes a single file upload, and attaches the file info to req.file
  //   // upload.array() is a middleware that processes multiple file uploads, and attaches the files info to req.files
  //   // upload.fields() is a middleware that processes multiple file uploads with different field names, and attaches the files info to req.files

  const multerStorage = multer.memoryStorage(); // Store file in memory as buffer (req.file.buffer) to process it later with sharp
  // Multer filter to allow only images
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true); //accept the file
    } else {
      cb(new ApiError("Not an image! Please upload only images.", 400), false); //reject the file
    }
  };
  // Initialize multer with the defined storage and file filter
  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload;
};

// //@description: This middleware uploads a single image
const uploadSingleImage = (fieldName) => multerOptions().single(fieldName); // multerOptions() returns upload

//@description: This middleware uploads array of image/s
const uploadMultipleImages = (imgArr) => {
  return multerOptions().fields(imgArr);
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
};
