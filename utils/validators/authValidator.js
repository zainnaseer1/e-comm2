const { check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middleware/validatorMiddleware.js");
const User = require("../../models/userModel.js");

const signUpValidator = [
  check("name")
    .escape()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 2, max: 40 })
    .withMessage("user Name must be between 2 and 40 characters long")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
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
    .escape()
    .optional()
    .trim()
    .isMobilePhone(["ar-IQ", "ar-AE", "ar-JO", "ar-KW", "ar-LB"]),
  check("profileImage").escape().optional(),
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
  validatorMiddleware,
];

const logInValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  check("password")
    .escape()
    .notEmpty()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Minimum password length is 6."),
  validatorMiddleware,
];

module.exports = {
  signUpValidator,
  logInValidator,
};
