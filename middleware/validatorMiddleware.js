const { validationResult } = require("express-validator");

// Middleware to handle validation errors
const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If there are validation errors
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
    });
  }
  next();
};

// Checker function to verify if all elements in target are included in array
const checker = (target, array) => target.every((val) => array.includes(val));

((module.exports = validatorMiddleware), (module.exports.checker = checker));
