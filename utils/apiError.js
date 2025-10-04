//@description A class for API errors (operational/predictable errors)
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message); // call parent Error class constructor and pass message
    this.statusCode = statusCode;

    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    //  This is a custom error class for handling API errors
    //  It distinguishes between operational errors (expected) and programming errors (unexpected)
    //  Operational errors are typically caused by user input or other predictable issues
    //  Programming errors are bugs in the code that need to be fixed

    Error.captureStackTrace(this, this.constructor); // exclude this class from stack trace
  }
}

module.exports = ApiError;
