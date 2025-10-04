const { check } = require("express-validator");
const bcrypt = require("bcrypt");
const validatorMiddleware = require("../../middleware/validatorMiddleware.js");
const User = require("../../models/userModel.js");

const allowedRoles = ["user", "manager", "admin"];

const createUserValidator = [
  check("name")
    .escape()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 2, max: 40 })
    .withMessage("user Name must be between 2 and 40 characters long"),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (value) => {
      const existing = await User.findOne({ email: value });
      if (existing) throw new Error("Email already exists");
      return true;
    }),
  check("phone")
    .optional()
    .trim()
    .isMobilePhone(["ar-IQ", "ar-AE", "ar-JO", "ar-KW", "ar-LB"]),
  check("profileImage").escape(),
  check("password")
    .escape()
    .notEmpty()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Minimum password length is 6.")
    .custom((password, { req }) => {
      if (password !== req.body.confirmPassword) {
        throw new Error("Password confirmation failed.");
      }
      return true;
    }),
  check("confirmPassword")
    .escape()
    .notEmpty()
    .withMessage("Please confirm your password")
    .trim(),
  check("role")
    .escape()
    .notEmpty()
    .default("user")
    .custom((value) => {
      if (!allowedRoles.includes(value)) {
        throw new Error(
          `Invalid status. Allowed values: ${allowedRules.join(", ")}`,
        );
      }
      return true;
    }),

  check("active").escape().notEmpty().isBoolean().default("true"),
  validatorMiddleware,
];

const getUserByIdValidator = [
  check("id")
    .escape()
    .isMongoId()
    .withMessage("Invalid user ID format")
    .notEmpty()
    .withMessage("user ID is required")
    .trim(),
  validatorMiddleware,
];

const updateUserByIdValidator = [
  check("id")
    .escape()
    .isMongoId()
    .withMessage("Invalid user ID format")
    .notEmpty()
    .withMessage("user ID is required")
    .trim(),
  check("name")
    .escape()
    .optional()
    .isLength({ min: 2, max: 40 })
    .withMessage("user name must be between 2 and 40 characters long"),
  check("email")
    .escape()
    .optional()
    .normalizeEmail()
    .isEmail()
    .toLowerCase()
    .custom(async (value) => {
      const existing = await User.findOne({ email: value });
      if (existing) throw new Error("Email already exists");
      return true;
    }),

  check("phone")
    .escape()
    .optional()
    .isMobilePhone(["ar-IQ", "ar-AE", "ar-JO", "ar-KW", "ar-LB"])
    .trim(),
  check("profileImage").escape().optional(),
  check("password")
    .escape()
    .optional()
    .isLength({ min: 6 })
    .withMessage("Minimum password length is 6.")
    .trim(),
  check("role")
    .escape()
    .optional()
    .default("user")
    .custom((value) => {
      if (!allowedRoles.includes(value)) {
        throw new Error(
          `Invalid status. Allowed values: ${allowedRules.join(", ")}`,
        );
      }
      return true;
    }),
  check("active").escape().optional().isBoolean().default("true"),
  validatorMiddleware,
];

const deleteUserByIdValidator = [
  check("id")
    .escape()
    .isMongoId()
    .withMessage("Invalid user ID format")
    .notEmpty()
    .withMessage("user ID is required"),
  validatorMiddleware,
];

const resetUserPasswordValidator = [
  check("currentPassword")
    .escape()
    .notEmpty()
    .withMessage("Enter your current Password.")
    .trim()
    .custom(async (currentPassword, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) throw new Error("No such user found.");
      currentPassword = await bcrypt.hash(currentPassword, 12);
      const match = await bcrypt.compare(
        req.body.currentPassword, // plain value entered by user
        user.password, // hashed password value stored in DB.
      );
      if (!match) throw new Error(`Failed to verify your current password`);

      return true;
    }),
  check("password")
    .escape()
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("Minimum password length is 6.")
    .custom((newPassword, { req }) => {
      if (newPassword !== req.body.confirmPassword) {
        throw new Error("Password confirmation failed.");
      }
      return true;
    }),
  check("confirmPassword")
    .escape()
    .notEmpty()
    .withMessage("Please confirm your password"),
  validatorMiddleware,
];

const updateMyPassValidator = [
  check("currentPassword")
    .escape()
    .notEmpty()
    .withMessage("Enter your current Password.")
    .trim()
    .custom(async (currentPassword, { req }) => {
      const user = await User.findById(req.user._id);
      if (!user) throw new Error("No such user found.");
      currentPassword = await bcrypt.hash(currentPassword, 12);
      const match = await bcrypt.compare(
        req.body.currentPassword, // plain value entered by user
        user.password, // hashed password value stored in DB.
      );
      if (!match) throw new Error(`Failed to verify your current password`);

      return true;
    }),
  check("password")
    .escape()
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("Minimum password length is 6.")
    .custom((newPassword, { req }) => {
      if (newPassword !== req.body.confirmPassword) {
        throw new Error("Password confirmation failed.");
      }
      return true;
    }),
  check("confirmPassword")
    .escape()
    .notEmpty()
    .withMessage("Please confirm your password"),
  validatorMiddleware,
];

const updateMyDataValidator = [
  check("name")
    .escape()
    .optional()
    .isLength({ min: 2, max: 40 })
    .withMessage("user name must be between 2 and 40 characters long"),
  // .custom(async (val, { req }) => {
  //   req.body.slug = await slugify(val);
  //   return true;
  // })
  check("email")
    .escape()
    .optional()
    .normalizeEmail()
    .isEmail()
    .toLowerCase()
    .custom(async (value) => {
      const existing = await User.findOne({ email: value });
      if (existing) throw new Error("Email already exists");
      return true;
    }),
  check("phone")
    .escape()
    .optional()
    .isMobilePhone(["ar-IQ", "ar-AE", "ar-JO", "ar-KW", "ar-LB"])
    .trim(),
  check("profileImage").escape().optional(),

  validatorMiddleware,
];

module.exports = {
  createUserValidator,
  getUserByIdValidator,
  updateUserByIdValidator,
  deleteUserByIdValidator,
  resetUserPasswordValidator,
  updateMyPassValidator,
  updateMyDataValidator,
};
