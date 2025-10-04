const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const slugify = require("slugify");

const ApiError = require("../utils/apiError.js");
const Category = require("../models/categoryModel.js");
const ApiFeatures = require("../utils/apiFeatures.js");
const pickFields = require("../utils/pickFields.js");

// // factory function to create a new document
exports.createOne = (Model, popOptions) =>
  asyncHandler(async (req, res, next) => {
    // If creating a subcategory, ensure the parent category exists
    if (req.body.parentCategory) {
      const category = await Category.findById(req.body.parentCategory);
      if (!category) {
        return next(
          new ApiError(
            `No category found with ID: ${req.body.parentCategory}`,
            404,
          ),
        );
      }
    }
    // if (req.body.name) req.body.slug = slugify(req.body.name);
    if (Model == "User") req.body.role = req.body.role || "user";

    //  use model’s declared safe fields
    const allowedFields = Model.allowedFields || [];
    //  detect unknown fields
    const bodyKeys = Object.keys(req.body); // Get all keys from req.body, e.g. ['name', 'description', 'extraField']
    // Find any fields in bodyKeys that are not in allowedFields
    const extraFields = bodyKeys.filter((k) => !allowedFields.includes(k)); // are there any not allowed fields in req.body?
    if (extraFields.length > 0) {
      return next(
        new ApiError(`Unknown own fields: ${extraFields.join(", ")}`, 400),
      );
    }
    const body = pickFields(req.body, allowedFields);
    // Create the new document with only allowed fields
    let newDoc = await Model.create(body);
    // Populate only when options are provided, and await to catch errors
    if (popOptions) {
      await newDoc.populate(popOptions);
    }

    res.status(201).json({
      status: "success",
      data: {
        data: newDoc,
      },
    });
  });

// // factory function to get all documents
exports.getAll = (Model, popOptions) =>
  // factory function to get all documents with optional parent category filter
  // If categoryId is passed in params, filter by parentCategory
  // Otherwise, return all documents
  // This function can be used for both categories and subcategories
  // Example usage: getAll(SubCategory) or getAll(Category)

  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) filter = req.filterObj;

    let features = new ApiFeatures(Model.find(filter), req.query)
      .keywordSearch() // "SubCategory" is optional here, as ApiFeatures can handle generic keyword search
      .sort()
      .filter()
      .limitFields();

    features.filterObj = { $and: [features.filterObj, filter] }; // Merge existing filters with parentCategory filter if any

    // Debugging logs
    // console.log("Keyword raw:", JSON.stringify(req.query.keyword));
    // console.log(
    //   "Final filterObj:",
    //   JSON.stringify(features.filterObj, null, 2),
    // );
    // const test = await Model.find(features.filterObj);
    // console.log("Matches found:", test.length);

    const totalCount = await Model.countDocuments(features.filterObj || {});
    features.paginate(totalCount); // Apply pagination and send total count to the client

    let document = await features.build();

    // Populate results only if popOptions provided
    if (popOptions) {
      document = await Model.populate(document, popOptions);
    }

    res.status(200).json({
      status: "success",
      pagination: features.pagination,
      data: document,
    });
  });

// factory function to get a single document by ID
exports.getOne = (Model, popOptions) =>
  asyncHandler(async (req, res, next) => {
    const id = req.params.id || req.params.orderId;
    let query = await Model.findById(id);

    if (popOptions) query = query.populate(popOptions);

    const document = await query;
    if (!document) {
      return next(
        new ApiError(`No document found with this ID:${req.params}`, 404),
      ); // using next to pass error to global error handler
    }
    res.status(200).json({
      status: "success",
      data: {
        data: document,
      },
    });
  });

// factory function to update a document by ID
exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let updates = { ...req.body }; // Create a shallow copy of req.body to avoid direct mutation

    //  use model’s declared safe fields
    let allowedFields = Model.allowedFields || [];
    if (Model == "User") {
      const valueToRemove = "password";
      const index = allowedFields.indexOf(valueToRemove);
      if (index > -1) {
        allowedFields.splice(index, 1); // removes first occurrence only
      }
      console.log(allowedFields);
      // allowedFields[5]="password". if updating a user info, exclude password field from being changed through this route, there is a specified rout for resetting password.
    }

    //  detect unknown fields
    const bodyKeys = Object.keys(req.body); // Get all keys from req.body, e.g. ['name', 'description', 'extraField']
    // Find any fields in bodyKeys that are not in allowedFields
    const extraFields = bodyKeys.filter((k) => !allowedFields.includes(k)); // are there any not allowed fields in req.body?
    if (extraFields.length > 0) {
      return next(
        new ApiError(`Unknown fields: ${extraFields.join(", ")}`, 400),
      );
    }
    updates = pickFields(req.body, allowedFields);
    // Create the new document with only allowed fields

    const document = await Model.findByIdAndUpdate(
      id,
      // add slug if name is being updated
      { ...updates, ...(updates.name && { slug: slugify(updates.name) }) }, // ...updates is the spread operator that copies all properties from  updates and paste them in new instance
      {
        new: true,
        runValidators: true,
      },
    );
    if (!document) {
      return next(new ApiError(`No document found with this ID:${id}`, 404)); // using next to pass error to global error handler
    }
    // trigger save action to update ratings and their avg
    document.save();

    res.status(200).json({
      status: "success",
      data: {
        data: document,
      },
    });
  });

//@description: This function resets user password
//@route: PATCH /api/v1/users/resetPassword/:id
//@access: Private
exports.resetPassword = (Model) =>
  asyncHandler(async (req, res, next) => {
    if (!req.body.password) {
      return next(new ApiError("Password is required.", 400));
    }
    const document = await Model.findByIdAndUpdate(
      req.params.id,
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: Date.now(),
      },
      { new: true, runValidators: true },
    );
    if (!document) {
      return next(new ApiError(`Password reset failed.`));
    }
    res.status(200).json({
      status: "success",
      data: { password: document.password },
    });
  });

//factory function to delete a document
exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findById(id);
    if (!document) {
      return next(new ApiError(`No product found with this ID:${id}`, 404)); // using next to pass error to global error handler
    }

    await document.deleteOne();

    // 204 No Content should not include a response body
    res.status(204).end();
  });
