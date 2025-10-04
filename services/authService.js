const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/apiError.js");
const sendEmail = require("../utils/sendEmail.js");
const createToken = require("../utils/createToken.js");

const User = require("../models/userModel.js");

//@description : sign-up
//@route POST /api/v1/auth/signup
//@access public
exports.signUp = asyncHandler(async (req, res, next) => {
  // 1) create user.
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
  });
  if (!user) return next(new ApiError("Sign-Up Failed.", 404));
  // 2) Generate token.
  const token = createToken(user._id);

  res.status(201).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
});

//@description : login
//@route POST /api/v1/auth/login
//@access public
exports.login = asyncHandler(async (req, res, next) => {
  // 1.1) find user by email
  const user = await User.findOne({ email: req.body.email });
  // Use a dummy hash if no user exists to prevent timing attacks
  const dummyHash = "$2b$10$dummyhashdummyhashdummyhashuu";
  const hash = user ? user.password : dummyHash;

  // 1.2) check password
  const isPasswordValid = await bcrypt.compare(req.body.password, hash);

  if (!user || !isPasswordValid) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  // 2) Generate token.
  const token = createToken(user._id);

  res.status(200).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
});

exports.authenticated = asyncHandler(async (req, res, next) => {
  //1) check if token exists.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // returns array and split each item by space
    // console.log("token:", token);
  }
  if (!token) {
    return next(
      new ApiError(
        `You are not logged in, please login with the authorized account.`,
        401,
      ),
    );
  }

  //2) verify token (no change occurred or expired)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log("decoded token: ", decoded);

  //3) check if user exists
  const currentUser = await User.findOne({ _id: decoded.userId }); // find user by the id conducted from the token
  if (!currentUser)
    next(
      new ApiError("No user belong to this token at the current time."),
      401,
    );

  //4) check if password changed after generating token
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
    ); //change date to timestamp to compare it with decoded.iat, ps: getTime() returns time in ms, decoded.iat is in s, so we divide by 1000 to compare them.
    // if password changed after token is generated:
    if (passwordChangedTimestamp > decoded.iat)
      return next(
        new ApiError(
          `This user recently changed their password, please login again..`, // login again(with new password) so token time renews
          401,
        ),
      );
  }
  req.user = currentUser; // so we can access this user by req.body within another middleware
  next();
});

//authorized? (users permissions)
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // Safety check: ensure user is authenticated first
    if (!req.user) {
      return next(new ApiError("Please authenticate first", 401));
    }
    // req.user was sent within authenticated()
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403),
      );
    }
    next();
  });

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  //1) get user by email.
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new ApiError(
        `There is no user registered to this email"${req.body.email}"`,
        404,
      ),
    );

  //2) if user exists, generate hashed random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // must be encrypted, sensitive data
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // console.log("original reset code:", resetCode);
  // console.log("Hashed reset code:", hashedResetCode);
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // expires in 10m, how_many_minutes * 1m * time in s
  user.PasswordResetVerified = false;

  await user.save();

  //3) send the reset code via email
  const resetMessage = `Hi ${user.name}, \nwe received a request to reset your account's password. \nYou can use the code we provided below (do not share it with anyone) to reset your password within 10 minutes: \n${resetCode}\n\n Thanks for helping us keeping your account secure.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset verification code (expires in 10 minutes).",
      message: resetMessage,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.PasswordResetVerified = undefined;
    await user.save();
    return next(new ApiError(`Error occurred while sending Email.`, 500));
  }

  res.status(200).json({
    status: "success",
    message: `Reset code sent to ${user.email}`,
  });
});

//@description : verify password reset
//@route POST /api/v1/auth/forgotPassword/verifyResetCode
//@access public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  //1) get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user)
    return next(new ApiError(`Invalid or Expired password reset code.`));

  //2) set "passwordResetCode" to true
  user.PasswordResetVerified = true;
  user.passwordResetExpires = Date.now();

  await user.save();

  res.status(200).json({ status: "success" });
});

//@description : reset password
//@route POST /api/v1/auth/forgotPassword/verifyResetCode/resetPassword
//@access public
exports.resetPass = asyncHandler(async (req, res, next) => {
  //1) get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new ApiError(
        `No user found with the provided email:${req.body.email}`,
        404,
      ),
    );
  //2) check if "passwordResetVerified" is true or not
  if (!user.PasswordResetVerified)
    return next(
      new ApiError(
        `Please verify your password reset code.\nCheck your Email.`,
        400,
      ),
    );
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.PasswordResetVerified = undefined;

  await user.save();

  //3) generate new token
  const token = createToken(user._id);
  res.status(200).json({
    status: "success",
    data: { message: `Your new password has been successfully set.`, token },
  });
});
