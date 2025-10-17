const qs = require("qs");

class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery; // mongooseQuery = Model.find()
    this.queryString = queryString; // queryString = req.query
    this.filterObj = {}; // master filter object
  }

  filter() {
    const queryObj = { ...this.queryString }; // Create a shallow copy of req.query
    const parsed = qs.parse(queryObj, { allowDots: true, depth: 10 });

    const excludedFields = ["page", "sort", "limit", "fields", "keyword"]; // fields to exclude from query
    excludedFields.forEach((el) => delete parsed[el]); // remove excluded fields

    let queryStr = JSON.stringify(parsed); // Convert to string for regex replacement
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in)\b/g, //to add $ sign before query operators
      (match) => `$${match}`, // add $ sign
    );

    const mongoFilter = JSON.parse(queryStr); // Convert back to object

    const convertTypes = (obj) => {
      if (!obj || typeof obj !== "object") return;
      for (let key in obj) {
        if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
          // checks whether obj[key] is a plain object (not an array) and if so, calls convertTypes on it so nested objects get processed recursively.
          convertTypes(obj[key]);
        } else {
          if (!isNaN(obj[key]))
            obj[key] = Number(obj[key]); // convert numeric strings to numbers
          else if (obj[key] === "true") obj[key] = true;
          else if (obj[key] === "false") obj[key] = false;
        }
      }
    };
    convertTypes(mongoFilter);

    // ✅ store filter but don't apply yet
    this.filterObj = { ...this.filterObj, ...mongoFilter }; // Merge with existing filter

    return this;
  }

  keywordSearch() {
    // if (req.query.keyword)
    if (this.queryString.keyword) {
      const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special characters for regex, regex is used for partial matching
      const keyword = escapeRegex(this.queryString.keyword.trim());

      {
        const keywordFilter = {
          $or: [
            { name: { $regex: keyword, $options: "i" } }, // find Match with name case insensitive
            { description: { $regex: keyword, $options: "i" } }, // find Match with description case insensitive
          ],
        };
        // ✅ use $and so both filterObj and keywordFilter must match
        this.filterObj = { $and: [this.filterObj, keywordFilter] };
      }
    }
    return this;
  }

  sort() {
    // accept ?sort=price&sort=sold or ?sort=price,-sold
    let sortParam = this.reqQuery?.sort;

    // if polluted/duplicated, take the last one
    if (Array.isArray(sortParam)) sortParam = sortParam.at(-1);

    // final string for Mongoose: "price -sold" etc.
    const sortBy = sortParam
      ? String(sortParam).split(",").join(" ")
      : "-createdAt"; // default

    this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    return this;
  }

  limitFields() {
    // if (req.query.fields)
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields); // include only selected fields
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v"); // exclude version field if no fields are specified
    }
    return this;
  }

  paginate(totalCount) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 20;
    const skip = (page - 1) * limit; // Calculate skip value, page 2-1 * limit 4:- skip 4

    this.pagination = {};
    this.pagination.totalPages = Math.ceil(totalCount / limit);
    this.pagination.currentPage = page;

    this.pagination.totalResults = totalCount;
    this.pagination.resultsOnCurrentPage = Math.min(limit, totalCount - skip); // selects min No. ei: limit or: totalCount - skip, 6-4 => 2

    this.pagination.limit = limit;
    this.pagination.nextPage =
      page < this.pagination.totalPages ? page + 1 : undefined;
    this.pagination.prevPage = page > 1 ? page - 1 : undefined;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    return this;
  }

  build() {
    // ✅ finally apply the merged filter here
    this.mongooseQuery = this.mongooseQuery.find(this.filterObj);
    return this.mongooseQuery;
  }
}

module.exports = ApiFeatures;
