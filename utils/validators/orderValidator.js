const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware.js");

exports.cashOrderValidator = [
  check("phone")
    .trim()
    .optional()
    .isMobilePhone(["ar-IQ", "ar-AE", "ar-JO", "ar-KW", "ar-LB"])
    .trim(),
  validatorMiddleware,
];
