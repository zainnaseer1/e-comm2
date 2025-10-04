const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

//@DESC add address ti user addresses array
//@ROUTE POST /api/v1/addresses/add
//@ACCESS auth user
exports.addAddress = asyncHandler(async (req, res, next) => {
  //   const user =
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body }, // adding value to an array using mongodb, it don't adds the item again if already exists
    },
    { new: true, runValidators: true },
  );
  res.status(200).json({
    status: "success",
    data: user.addresses,
  });
});

//@DESC get logged user addresses
//@ROUTE POST /api/v1/addresses/getAll
//@ACCESS auth user
exports.getMyAddresses = asyncHandler(async (req, res, next) => {
  // If you need to refresh the user from DB to get latest wishlist:
  const user = await User.findById(req.user._id).select("addresses");
  //   if (!user) return new ApiError(`User not found.`, 404);
  user.addresses ? user.addresses : [];
  // fetch products whose _id is in the wishlist array

  return res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});

//@DESC remove address
//@ROUTE DELETE /api/v1/addresses/remove/:addressId
//@ACCESS auth user
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } }, // removing value from an array using mongodb.
    },
    { new: true },
  );
  if (!user) return new ApiError(`User not found.`, 404);

  res.status(200).json({
    status: "success",
    message: "address is removed.",
  });
});
