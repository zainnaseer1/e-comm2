const ApiError = require("../utils/apiError");

const sendErrorForDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    // error: err.isOperational ? err : 'Internal Server Error', //if true send error details
    error: err,
    //message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProd = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.isOperational ? err.message : "Something went wrong!", // if false send generic user friendly message
  });
};

const handleJwtInvalidSignature = () =>
  new ApiError("Invalid token, please login again.", 401);

const handleJwtExpired = () =>
  new ApiError("Expired token, please login again.", 401);

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
    if (err.name === "TokenExpiredError") err = handleJwtExpired();
    sendErrorForProd(err, res);
  }
};

module.exports = globalErrorHandler;
