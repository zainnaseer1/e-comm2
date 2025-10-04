const mongoose = require("mongoose");
// const slugify = require("slugify");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required."],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is a required."],
      unique: [true, "Please use different Email."],
      lowercase: [true, "Email must be in lowercase."],
    },
    phone: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters long."],
    },
    passwordChangedAt: { type: Date },
    passwordResetCode: { type: String },
    passwordResetExpires: { type: Date },
    PasswordResetVerified: { type: Boolean },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String, //check if unique
        details: String,
        phone: String, // try making the user default phone
        city: String,
        postalCode: { type: String, required: false },
      },
    ], // can add multiple addresses
    // wishlist contains products, child reference
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
    ],
  },
  { timestamps: true },
);

// Schema-level guard: limit addresses to max 5
userSchema.path("addresses").validate(function (v) {
  return !Array.isArray(v) || v.length <= 5; // return true on these two conditions
}, "Cant save more than 5 addresses."); // else throw this error

// Defensive check for update operators pushing/adding addresses
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() || {};

  const addToSet = update.$addToSet && update.$addToSet.addresses; // check if using $addToSet method for addresses
  const push = update.$push && update.$push.addresses; // check if pushing an item to addresses array
  const setArr =
    update.$set && Array.isArray(update.$set.addresses)
      ? update.$set.addresses
      : null;

  // If not modifying addresses array, skip
  if (!addToSet && !push && !setArr) return next();

  try {
    const doc = await this.model.findOne(this.getQuery()).select("addresses");
    const current = Array.isArray(doc?.addresses) ? doc.addresses.length : 0;

    // Determine how many items are being added
    let toAdd = 0;
    if (setArr) {
      // Directly setting the array
      if (setArr.length > 5) {
        const err = new mongoose.Error.ValidationError();
        err.addError(
          "addresses",
          new mongoose.Error.ValidatorError({
            message: "Cant save more than 5 addresses.",
          }),
        );
        return next(err);
      }
      return next();
    }

    if (push && typeof push === "object" && Array.isArray(push.$each)) {
      toAdd = push.$each.length;
    } else if (push || addToSet) {
      toAdd = 1; // single element being added
    }

    if (current + toAdd > 5) {
      const err = new mongoose.Error.ValidationError();
      err.addError(
        "addresses",
        new mongoose.Error.ValidatorError({
          message: "Cant save more than 5 addresses.",
        }),
      );
      return next(err);
    }
    return next();
  } catch (e) {
    return next(e);
  }
});

// Function to set full image URL
const setImageURL = (doc) => {
  if (doc.profileImage) {
    doc.profileImage = `${process.env.BASE_URL}/users/${doc.profileImage}`;
    return doc.profileImage;
  }
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

//post init hook to modify the image field to include the full URL
userSchema.post("init", (doc) => {
  setImageURL(doc);
});
//post save
userSchema.post("save", (doc) => {
  setImageURL(doc);
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

User.allowedFields = [
  "name", //User.allowedFields[0]
  "slug", //User.allowedFields[1]
  "email", //User.allowedFields[2]
  "phone", //User.allowedFields[3]
  "profileImage", //User.allowedFields[4]
  "password", //User.allowedFields[5]
  "confirmPassword",
  "passwordChangedAt",
  "passwordResetCode",
  "PasswordResetVerified",
  "role",
  "active",
];

module.exports = User;
