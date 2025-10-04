const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const sharp = require("sharp");
const { v4: uuid4 } = require("uuid"); // For generating unique IDs for file names, v4 is version 4 of uuid
const bcrypt = require("bcrypt");

const factory = require("./handlersFactory.js");
const { uploadSingleImage } = require("../middleware/uploadImageMiddleware.js");
const createToken = require("../utils/createToken.js");
const User = require("../models/userModel.js");

const uploadUserImage = uploadSingleImage("profileImage"); // 'image' is the field name in the form-data

// Image processing using sharp
const resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(); // If no file is uploaded, proceed to the next middleware
  const fileName = `users-${uuid4()}-${Date.now()}.jpeg`; // Generate a unique file name for the resized image

  // Process the image
  if (req.file.buffer) {
    await sharp(req.file.buffer) // Use the file buffer from memory storage
      .resize(600, 600) // Resize to 600x600 pixels
      .toFormat("jpeg") // Convert to JPEG format
      .jpeg({ quality: 95 }) // Set JPEG quality to 90
      .toFile(`uploads/users/resized-${fileName}`); // Save the processed image with 'resized-' prefix

    req.body.profileImage = `resized-${fileName}`; // Save the image name to req.body to be used in the controller
    req.file.filename = `resized-${fileName}`; // Update req.file.filename to the new resized image name
    req.file.path = `uploads/users/resized-${fileName}`; // Update req.file.path to point to the resized image
    console.log("Image resized and saved as:", req.file.path, req.file);
  }

  next(); // Proceed to the next middleware
});

//@description: This function creates a new user
//@route: POST /api/v1/users
//@access: Private/admin-manager
const createUser = factory.createOne(User);

//@description: This function retrieves all users
//@route: GET /api/v1/users
//@access: private/admin-manager
const getAllUsers = factory.getAll(User);

//@description: This function retrieves a user by ID
//@route: GET /api/v1/users/:id
//@access: Public
const getUserById = factory.getOne(User);

//@description: This function updates a User by ID
//@route: PATCH /api/v1/users/:id
//@access: Private/admin-manager
const updateUser = factory.updateOne(User);

//@description: This function resets user password
//@route: PATCH /api/v1/users/resetPassword/:id
//@access: Private
const resetUserPassword = factory.resetPassword(User);

//@description: This function deletes a User by ID
//@route: DELETE /api/v1/users/:id
//@access: Private/admin
const deleteUser = factory.deleteOne(User);

//@description: This function retrieves logged user data
//@route: GET /api/v1/users/getMe
//@access: private/authenticated
const getMyData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

//@desc: let logged user edit their password only
//@route: PUT /api/v1/users/updateMyPass
//@access: private/authenticated
const updateMyPass = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true, runValidators: true },
  );
  if (!user) {
    return next(new ApiError(`Password reset failed.`));
  }
  const token = createToken(user._id);
  res.status(200).json({ status: "success", data: { user, token } });
});

//@desc: let logged user edit their data (without password and role)
//@route: PUT /api/v1/users/update/myData
//@access: private/authenticated
const updateMyData = asyncHandler(async (req, res, next) => {
  // //  use model’s declared safe fields
  // const allowedFields = User.allowedFields || [];
  // //  detect unknown fields
  // const bodyKeys = Object.keys(req.body); // Get all keys from req.body, e.g. ['name', 'description', 'extraField']
  // // Find any fields in bodyKeys that are not in allowedFields
  // const extraFields = bodyKeys.filter((k) => !allowedFields.includes(k)); // are there any not allowed fields in req.body?
  // if (extraFields.length > 0) {
  //   return next(
  //     new ApiError(`Unknown own fields: ${extraFields.join(", ")}`, 400),
  //   );
  // }
  // const body = await pickFields(req.body, allowedFields);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name, //will update only the following fields and neglect any extra entered fields
      slug: req.body.name ? slugify(req.body.name) : undefined,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true, runValidators: true },
  );

  res.status(200).json({ status: "success", data: { updatedUser } });
});

//@desc: Deactivate logged user account
//@route: DELETE /api/v1/users/deleteMe
//@access: private/authenticated
const deactivateMyAccount = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  await User.findByIdAndUpdate(id, { active: false });

  res.status(204).json({ status: "success" });
});
// can add another route for activating account
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  resetUserPassword,
  deleteUser,
  getMyData,
  updateMyPass,
  updateMyData,
  deactivateMyAccount,
  uploadUserImage,
  resizeImage,
};
