const express = require("express");
const auth = require("../services/authService.js");
const {
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
} = require("../services/userService.js");
const {
  createUserValidator,
  getUserByIdValidator,
  updateUserByIdValidator,
  deleteUserByIdValidator,
  resetUserPasswordValidator,
  updateMyPassValidator,
  updateMyDataValidator,
} = require("../utils/validators/userValidator.js");
// Initialize router
const router = express.Router();
//middleware
router.use(express.json());

router.use(auth.authenticated);

// Routes

router
  .route("/")
  .post(
    auth.allowedTo("admin"),
    uploadUserImage,
    resizeImage,
    createUserValidator,
    createUser,
  )
  .get(auth.allowedTo("admin", "manager"), getAllUsers);

router
  .route("/byId/:id")
  .get(getUserByIdValidator, getUserById)
  .put(
    auth.allowedTo("admin", "manager"),
    uploadUserImage,
    resizeImage,
    updateUserByIdValidator,
    updateUser,
  ) // api handler is updateUser
  .delete(auth.allowedTo("admin"), deleteUserByIdValidator, deleteUser);

router.put(
  "/resetPassword/:id",
  auth.allowedTo("manager", "admin"),
  resetUserPasswordValidator,
  resetUserPassword,
);

//logged user routes
router.get("/logged/getMe", getMyData, getUserById);
router.put("/logged/updateMyPass", updateMyPassValidator, updateMyPass);
router.put("/logged/updateMyData", updateMyDataValidator, updateMyData);
router.delete("/logged/deleteMe", deactivateMyAccount);

module.exports = router;
