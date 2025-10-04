const express = require("express");
const auth = require("../services/authService.js");
const v = require("../utils/validators/wishlistValidator.js");
const s = require("../services/wishlistService.js");

//initialize router
const router = express.Router();
//middleware
router.use(express.json());
router.use(auth.authenticated, auth.allowedTo("user"));
//routes
router.post("/add", v.addToWishlistValidator, s.addToWishlist);

router.get("/getAll", s.getWishlist);

router.delete("/delete/:id", s.removeFromWishlist);

module.exports = router;
